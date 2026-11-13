import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	createAndPollJob,
	downloadOutputBinary,
	handleItemError,
	parseJsonIfString,
	uploadInputBinary,
} from '../../shared/job';

const SERVICE = { basePath: '/structflow', label: 'StructFlow' };

type InlineInputRaw = {
	id?: string;
	data?: unknown;
};

type InlineInputsParam = {
	input?: InlineInputRaw[];
};

const JSONL_MIME_TYPE = 'application/x-ndjson';

export async function runJobExecute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const model = this.getNodeParameter('model', i) as string;
			const systemPrompt = this.getNodeParameter('system_prompt', i) as string;
			const exampleOutput = parseJsonIfString(this.getNodeParameter('example_output', i));
			const inputMode = this.getNodeParameter('inputMode', i) as 'inline' | 'binary';

			const jobBody: IDataObject = {
				model,
				system_prompt: systemPrompt,
				example_output: exampleOutput as IDataObject,
			};

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

				const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

				returnData.push({
					json: {
						job_id: completed.jobId,
						model,
						status: completed.job.status,
						summary: completed.job.summary as IDataObject | undefined,
						results: completed.job.results as IDataObject[] | undefined,
						usage: completed.job.usage,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			jobBody.file_id = await uploadInputBinary.call(this, i, binaryPropertyName, {
				filename: 'input.jsonl',
				mimeType: JSONL_MIME_TYPE,
			});

			const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

			const outputBinary = await downloadOutputBinary.call(this, i, SERVICE, completed, {
				defaultFilename: `${completed.job.output_file_id ?? 'output'}.jsonl`,
				fallbackMimeType: JSONL_MIME_TYPE,
			});

			returnData.push({
				json: {
					job_id: completed.jobId,
					model,
					status: completed.job.status,
					output_file_id: completed.job.output_file_id,
					usage: completed.job.usage,
				},
				binary: {
					[binaryPropertyName]: outputBinary,
				},
				pairedItem: { item: i },
			});
		} catch (error) {
			handleItemError.call(this, error, i, items, returnData);
		}
	}

	return [returnData];
}
