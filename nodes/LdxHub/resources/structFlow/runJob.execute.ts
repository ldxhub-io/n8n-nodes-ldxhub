import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { downloadFile, uploadFile } from '../../shared/files';
import { pollJobUntilDone } from '../../shared/polling';
import { ldxHubApiRequest } from '../../shared/transport';

type PollingSettings = {
	serverWaitSeconds?: number;
	pollingMaxAttempts?: number;
};

type CreateJobResponse = {
	job_id: string;
	[key: string]: unknown;
};

type InlineInputRaw = {
	id?: string;
	data?: unknown;
};

type InlineInputsParam = {
	input?: InlineInputRaw[];
};

const JSONL_MIME_TYPE = 'application/x-ndjson';

function parseJsonIfString(value: unknown): unknown {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}
	return value;
}

export async function runJobExecute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const model = this.getNodeParameter('model', i) as string;
			const systemPrompt = this.getNodeParameter('system_prompt', i) as string;
			const exampleOutput = parseJsonIfString(
				this.getNodeParameter('example_output', i),
			);
			const inputMode = this.getNodeParameter('inputMode', i) as 'inline' | 'binary';
			const pollingSettings = this.getNodeParameter(
				'pollingSettings',
				i,
				{},
			) as PollingSettings;

			const jobBody: IDataObject = {
				model,
				system_prompt: systemPrompt,
				example_output: exampleOutput as IDataObject,
			};

			let binaryPropertyName: string | undefined;

			if (inputMode === 'inline') {
				const wrapper = this.getNodeParameter('inputs', i, {}) as InlineInputsParam;
				const rawInputs = wrapper.input ?? [];

				if (rawInputs.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Inline Inputs mode requires at least one input record',
						{ itemIndex: i },
					);
				}

				jobBody.inputs = rawInputs.map((r) => ({
					id: r.id,
					data: parseJsonIfString(r.data),
				}));
			} else {
				binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				const binaryMeta = this.helpers.assertBinaryData(i, binaryPropertyName);
				const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
				const filename = binaryMeta.fileName ?? 'input.jsonl';
				const mimeType = binaryMeta.mimeType ?? JSONL_MIME_TYPE;

				const uploadRes = await uploadFile.call(this, buffer, filename, mimeType);
				jobBody.file_id = uploadRes.file_id;
			}

			const jobRes = (await ldxHubApiRequest.call(
				this,
				'POST',
				'/structflow/jobs',
				jobBody,
			)) as CreateJobResponse;

			const finalJob = await pollJobUntilDone.call(
				this,
				{
					jobId: jobRes.job_id,
					endpoint: `/structflow/jobs/${encodeURIComponent(jobRes.job_id)}`,
					serviceLabel: 'StructFlow',
				},
				{
					serverWaitSeconds: pollingSettings.serverWaitSeconds ?? 10,
					pollingMaxAttempts: pollingSettings.pollingMaxAttempts ?? 180,
				},
				i,
			);

			if (inputMode === 'inline') {
				returnData.push({
					json: {
						job_id: jobRes.job_id,
						model,
						status: finalJob.status,
						summary: finalJob.summary as IDataObject | undefined,
						results: finalJob.results as IDataObject[] | undefined,
						usage: finalJob.usage,
					},
					pairedItem: { item: i },
				});
			} else {
				if (!finalJob.output_file_id) {
					throw new NodeOperationError(
						this.getNode(),
						`StructFlow job ${jobRes.job_id} completed but returned no output_file_id`,
						{ itemIndex: i },
					);
				}

				const download = await downloadFile.call(this, finalJob.output_file_id);
				const defaultFilename = `${finalJob.output_file_id}.jsonl`;
				const mimeType = download.mimeType || JSONL_MIME_TYPE;

				const outputBinary = await this.helpers.prepareBinaryData(
					download.buffer,
					download.filename ?? defaultFilename,
					mimeType,
				);

				returnData.push({
					json: {
						job_id: jobRes.job_id,
						model,
						status: finalJob.status,
						output_file_id: finalJob.output_file_id,
						usage: finalJob.usage,
					},
					binary: {
						[binaryPropertyName as string]: outputBinary,
					},
					pairedItem: { item: i },
				});
			}
		} catch (error) {
			if (this.continueOnFail()) {
				const wrapped =
					error instanceof NodeOperationError
						? error
						: new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				returnData.push({
					json: items[i].json,
					error: wrapped,
					pairedItem: { item: i },
				});
				continue;
			}
			const ctx = (error as { context?: { itemIndex?: number } }).context;
			if (ctx) ctx.itemIndex = i;
			throw error;
		}
	}

	return [returnData];
}
