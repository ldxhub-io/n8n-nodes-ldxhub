import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { downloadFile, uploadFile } from '../../shared/files';
import { pollJobUntilDone } from '../../shared/polling';
import { ldxHubApiRequest } from '../../shared/transport';

type RefineLoopOptions = {
	domain?: string;
	noteLanguage?: string;
	outputMode?: 'full' | 'translations' | 'none';
	customInstructions?: string;
	removeHyphenation?: boolean;
	excludeNumericSegments?: boolean;
};

type PollingSettings = {
	serverWaitSeconds?: number;
	pollingMaxAttempts?: number;
};

type CreateJobResponse = {
	job_id: string;
	[key: string]: unknown;
};

function buildRefineLoopBody(input: {
	fileId: string;
	model: string;
	maxRevisions: number;
	options: RefineLoopOptions;
}): IDataObject {
	const body: IDataObject = {
		file_id: input.fileId,
		model: input.model,
		max_revisions: input.maxRevisions,
	};

	const o = input.options;
	if (o.domain) body.domain = o.domain;
	if (o.noteLanguage) body.note_language = o.noteLanguage;
	if (o.outputMode) body.output_mode = o.outputMode;
	if (o.customInstructions) body.custom_instructions = o.customInstructions;
	if (o.removeHyphenation !== undefined) body.remove_hyphenation = o.removeHyphenation;
	if (o.excludeNumericSegments !== undefined) {
		body.exclude_numeric_segments = o.excludeNumericSegments;
	}

	return body;
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
			const maxRevisions = this.getNodeParameter('maxRevisions', i) as number;
			const options = this.getNodeParameter('options', i, {}) as RefineLoopOptions;
			const pollingSettings = this.getNodeParameter(
				'pollingSettings',
				i,
				{},
			) as PollingSettings;

			const binaryMeta = this.helpers.assertBinaryData(i, binaryPropertyName);
			const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
			const filename = binaryMeta.fileName ?? 'input.xliff';
			const mimeType = binaryMeta.mimeType ?? 'application/octet-stream';

			const uploadRes = await uploadFile.call(this, buffer, filename, mimeType);

			const jobBody = buildRefineLoopBody({
				fileId: uploadRes.file_id,
				model,
				maxRevisions,
				options,
			});
			const jobRes = (await ldxHubApiRequest.call(
				this,
				'POST',
				'/refineloop/jobs',
				jobBody,
			)) as CreateJobResponse;

			const finalJob = await pollJobUntilDone.call(
				this,
				jobRes.job_id,
				{
					serverWaitSeconds: pollingSettings.serverWaitSeconds ?? 10,
					pollingMaxAttempts: pollingSettings.pollingMaxAttempts ?? 180,
				},
				i,
			);

			if (!finalJob.output_file_id) {
				throw new NodeOperationError(
					this.getNode(),
					`RefineLoop job ${jobRes.job_id} completed but returned no output_file_id`,
					{ itemIndex: i },
				);
			}

			const download = await downloadFile.call(this, finalJob.output_file_id);
			const outputBinary = await this.helpers.prepareBinaryData(
				download.buffer,
				download.filename ?? 'refined.xliff',
				download.mimeType,
			);

			returnData.push({
				json: {
					job_id: jobRes.job_id,
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
			throw error;
		}
	}

	return [returnData];
}
