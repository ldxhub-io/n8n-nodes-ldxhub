import type {
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { downloadFile, uploadFile } from './files';
import type { JobResponse, PollConfig } from './polling';
import { pollJobUntilDone } from './polling';
import { ldxHubApiRequest } from './transport';

type PollingSettings = {
	serverWaitSeconds?: number;
	pollingMaxAttempts?: number;
};

type CreateJobResponse = {
	job_id: string;
	[key: string]: unknown;
};

export type JobService = {
	/** API path of the service, e.g. '/castdoc' */
	basePath: string;
	/** Name used in error messages, e.g. 'CastDoc' */
	label: string;
};

export function parseJsonIfString(value: unknown): unknown {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}
	return value;
}

function getPollConfig(this: IExecuteFunctions, itemIndex: number): PollConfig {
	const settings = this.getNodeParameter('pollingSettings', itemIndex, {}) as PollingSettings;
	return {
		serverWaitSeconds: settings.serverWaitSeconds ?? 10,
		pollingMaxAttempts: settings.pollingMaxAttempts ?? 180,
	};
}

/** Uploads the item's binary property to LDXhub and returns the file_id. */
export async function uploadInputBinary(
	this: IExecuteFunctions,
	itemIndex: number,
	binaryPropertyName: string,
	defaults: { filename: string; mimeType: string },
): Promise<string> {
	const binaryMeta = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	const uploadRes = await uploadFile.call(
		this,
		buffer,
		binaryMeta.fileName ?? defaults.filename,
		binaryMeta.mimeType ?? defaults.mimeType,
	);
	return uploadRes.file_id;
}

/** Creates a job and polls it until it completes (throws if it fails). */
export async function createAndPollJob(
	this: IExecuteFunctions,
	itemIndex: number,
	service: JobService,
	body: IDataObject,
): Promise<{ jobId: string; job: JobResponse }> {
	const created = (await ldxHubApiRequest.call(
		this,
		'POST',
		`${service.basePath}/jobs`,
		body,
	)) as CreateJobResponse;

	const job = await pollJobUntilDone.call(
		this,
		{
			jobId: created.job_id,
			endpoint: `${service.basePath}/jobs/${encodeURIComponent(created.job_id)}`,
			serviceLabel: service.label,
		},
		getPollConfig.call(this, itemIndex),
		itemIndex,
	);

	return { jobId: created.job_id, job };
}

/** Downloads the job's output file (throws if the job returned none). */
export async function downloadOutput(
	this: IExecuteFunctions,
	itemIndex: number,
	service: JobService,
	completed: { jobId: string; job: JobResponse },
	options: { defaultFilename: string; overrideMimeType?: string; fallbackMimeType?: string },
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
	const outputFileId = completed.job.output_file_id;
	if (!outputFileId) {
		throw new NodeOperationError(
			this.getNode(),
			`${service.label} job ${completed.jobId} completed but returned no output_file_id`,
			{ itemIndex },
		);
	}

	const download = await downloadFile.call(this, outputFileId);
	return {
		buffer: download.buffer,
		filename: download.filename ?? options.defaultFilename,
		mimeType:
			options.overrideMimeType ??
			(download.mimeType || options.fallbackMimeType || 'application/octet-stream'),
	};
}

/** Downloads the job's output file as n8n binary data. */
export async function downloadOutputBinary(
	this: IExecuteFunctions,
	itemIndex: number,
	service: JobService,
	completed: { jobId: string; job: JobResponse },
	options: { defaultFilename: string; overrideMimeType?: string; fallbackMimeType?: string },
): Promise<IBinaryData> {
	const output = await downloadOutput.call(this, itemIndex, service, completed, options);
	return await this.helpers.prepareBinaryData(output.buffer, output.filename, output.mimeType);
}

function isNodeError(error: unknown): error is NodeOperationError | NodeApiError {
	if (error instanceof NodeOperationError || error instanceof NodeApiError) return true;
	const name = (error as { name?: unknown } | undefined)?.name;
	return name === 'NodeOperationError' || name === 'NodeApiError';
}

function isHttpError(error: unknown): boolean {
	const e = error as { httpCode?: unknown; statusCode?: unknown; response?: unknown } | undefined;
	return !!e && (e.httpCode !== undefined || e.statusCode !== undefined || e.response !== undefined);
}

/**
 * Turns an error of one item into an n8n error tied to that item. Errors the node already raised
 * (job failed, missing output, expired file, API errors) keep their message; HTTP errors become
 * NodeApiError and anything else NodeOperationError. With Continue On Fail the item is returned
 * with the error, otherwise the error is thrown.
 */
export function handleItemError(
	this: IExecuteFunctions,
	error: unknown,
	itemIndex: number,
	items: INodeExecutionData[],
	returnData: INodeExecutionData[],
): void {
	let nodeError: NodeOperationError | NodeApiError;
	if (isNodeError(error)) {
		nodeError = error;
	} else if (isHttpError(error)) {
		nodeError = new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
	} else {
		nodeError = new NodeOperationError(this.getNode(), error as Error, { itemIndex });
	}
	if (nodeError.context) nodeError.context.itemIndex = itemIndex;

	if (this.continueOnFail()) {
		returnData.push({
			json: items[itemIndex].json,
			error: nodeError,
			pairedItem: { item: itemIndex },
		});
		return;
	}
	throw nodeError;
}
