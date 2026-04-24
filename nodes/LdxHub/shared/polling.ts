import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ldxHubApiRequest } from './transport';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type APIError = {
	request_id?: string;
	code?: string;
	message?: string;
};

export type JobResponse = {
	job_id: string;
	status: JobStatus;
	output_file_id?: string;
	error?: APIError;
	usage?: Record<string, unknown>;
	[key: string]: unknown;
};

export type PollConfig = {
	serverWaitSeconds: number;
	pollingMaxAttempts: number;
};

export async function pollJobUntilDone(
	this: IExecuteFunctions,
	jobId: string,
	config: PollConfig,
	itemIndex: number,
): Promise<JobResponse> {
	for (let attempt = 1; attempt <= config.pollingMaxAttempts; attempt++) {
		const res = (await ldxHubApiRequest.call(
			this,
			'GET',
			`/refineloop/jobs/${encodeURIComponent(jobId)}`,
			undefined,
			{ wait: config.serverWaitSeconds },
		)) as JobResponse;

		switch (res.status) {
			case 'completed':
				return res;
			case 'failed': {
				const code = res.error?.code ? ` [${res.error.code}]` : '';
				const msg = res.error?.message ?? 'no error details returned by API';
				throw new NodeOperationError(
					this.getNode(),
					`RefineLoop job ${jobId} failed${code}: ${msg}`,
					{ itemIndex },
				);
			}
			case 'queued':
			case 'processing':
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unexpected status '${res.status}' for RefineLoop job ${jobId}`,
					{ itemIndex },
				);
		}
	}

	throw new NodeOperationError(
		this.getNode(),
		`RefineLoop job ${jobId} exceeded max poll attempts (${config.pollingMaxAttempts})`,
		{ itemIndex },
	);
}
