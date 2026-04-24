import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { downloadFile } from '../../shared/files';
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
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

// Binary property name used for the output file. Hardcoded to match n8n
// convention for nodes that produce a single binary output.
const OUTPUT_BINARY_FIELD = 'data';

export async function runJobExecute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const engine = this.getNodeParameter('engine', i) as string;
			const fileId = this.getNodeParameter('file_id', i) as string;
			const outputFormat = this.getNodeParameter('output_format', i) as string;
			const pollingSettings = this.getNodeParameter(
				'pollingSettings',
				i,
				{},
			) as PollingSettings;

			const jobBody: IDataObject = {
				engine,
				file_id: fileId,
				output_format: outputFormat,
			};
			const jobRes = (await ldxHubApiRequest.call(
				this,
				'POST',
				'/castdoc/jobs',
				jobBody,
			)) as CreateJobResponse;

			const finalJob = await pollJobUntilDone.call(
				this,
				{
					jobId: jobRes.job_id,
					endpoint: `/castdoc/jobs/${encodeURIComponent(jobRes.job_id)}`,
					serviceLabel: 'CastDoc',
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
					`CastDoc job ${jobRes.job_id} completed but returned no output_file_id`,
					{ itemIndex: i },
				);
			}

			const download = await downloadFile.call(this, finalJob.output_file_id);
			const overrideMime = OUTPUT_MIME_TYPES[outputFormat] ?? download.mimeType;
			const defaultFilename = `output.${outputFormat}`;

			const outputBinary = await this.helpers.prepareBinaryData(
				download.buffer,
				download.filename ?? defaultFilename,
				overrideMime,
			);

			returnData.push({
				json: {
					job_id: jobRes.job_id,
					status: finalJob.status,
					output_file_id: finalJob.output_file_id,
				},
				binary: {
					[OUTPUT_BINARY_FIELD]: outputBinary,
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
