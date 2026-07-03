import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

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

const OUTPUT_MIME_TYPES: Record<string, string> = {
	json: 'application/json',
};

const OUTPUT_FILE_EXTENSIONS: Record<string, string> = {
	json: 'json',
};

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
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const model = this.getNodeParameter('model', i) as string;
			const systemPrompt = this.getNodeParameter('system_prompt', i) as string;
			const exampleOutput = parseJsonIfString(
				this.getNodeParameter('example_output', i),
			);
			const outputFormat = this.getNodeParameter('output_format', i) as string;
			const pollingSettings = this.getNodeParameter(
				'pollingSettings',
				i,
				{},
			) as PollingSettings;

			const binaryMeta = this.helpers.assertBinaryData(i, binaryPropertyName);
			const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
			const filename = binaryMeta.fileName ?? 'input';
			const mimeType = binaryMeta.mimeType ?? 'application/octet-stream';

			const uploadRes = await uploadFile.call(this, buffer, filename, mimeType);

			const jobBody: IDataObject = {
				model,
				file_id: uploadRes.file_id,
				system_prompt: systemPrompt,
				example_output: exampleOutput as IDataObject,
				output_format: outputFormat,
			};
			const jobRes = (await ldxHubApiRequest.call(
				this,
				'POST',
				'/analyzedoc/jobs',
				jobBody,
			)) as CreateJobResponse;

			const finalJob = await pollJobUntilDone.call(
				this,
				{
					jobId: jobRes.job_id,
					endpoint: `/analyzedoc/jobs/${encodeURIComponent(jobRes.job_id)}`,
					serviceLabel: 'AnalyzeDoc',
				},
				{
					serverWaitSeconds: pollingSettings.serverWaitSeconds ?? 10,
					pollingMaxAttempts: pollingSettings.pollingMaxAttempts ?? 180,
				},
				i,
			);

			if (!finalJob.output_file_id) {
				throw new NodeOperationError(
					this.getNode(),
					`AnalyzeDoc job ${jobRes.job_id} completed but returned no output_file_id`,
					{ itemIndex: i },
				);
			}

			const download = await downloadFile.call(this, finalJob.output_file_id);
			const overrideMime = OUTPUT_MIME_TYPES[outputFormat] ?? download.mimeType;
			const ext = OUTPUT_FILE_EXTENSIONS[outputFormat] ?? outputFormat;
			const defaultFilename = `output.${ext}`;

			const outputBinary = await this.helpers.prepareBinaryData(
				download.buffer,
				download.filename ?? defaultFilename,
				overrideMime,
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
					[binaryPropertyName]: outputBinary,
				},
				pairedItem: { item: i },
			});
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
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return [returnData];
}
