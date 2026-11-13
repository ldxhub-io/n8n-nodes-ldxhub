import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import {
	createAndPollJob,
	downloadOutputBinary,
	handleItemError,
	uploadInputBinary,
} from '../../shared/job';

const SERVICE = { basePath: '/refineloop', label: 'RefineLoop' };

type RefineLoopOptions = {
	domain?: string;
	noteLanguage?: string;
	outputMode?: 'full' | 'translations' | 'none';
	customInstructions?: string;
	removeHyphenation?: boolean;
	excludeNumericSegments?: boolean;
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

			const fileId = await uploadInputBinary.call(this, i, binaryPropertyName, {
				filename: 'input.xliff',
				mimeType: 'application/octet-stream',
			});

			const jobBody = buildRefineLoopBody({
				fileId,
				model,
				maxRevisions,
				options,
			});
			const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

			const json = {
				job_id: completed.jobId,
				model,
				status: completed.job.status,
				output_file_id: completed.job.output_file_id,
				usage: completed.job.usage,
			};

			// Output Mode "None" returns only the job metadata, so a missing output file is expected there.
			if (!completed.job.output_file_id && options.outputMode === 'none') {
				returnData.push({ json, pairedItem: { item: i } });
				continue;
			}

			const outputBinary = await downloadOutputBinary.call(this, i, SERVICE, completed, {
				defaultFilename: 'refined.xliff',
			});

			returnData.push({
				json,
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
