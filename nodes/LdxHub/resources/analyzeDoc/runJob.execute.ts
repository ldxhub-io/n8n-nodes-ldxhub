import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import {
	createAndPollJob,
	downloadOutputBinary,
	handleItemError,
	parseJsonIfString,
	uploadInputBinary,
} from '../../shared/job';

const SERVICE = { basePath: '/analyzedoc', label: 'AnalyzeDoc' };

const OUTPUT_MIME_TYPES: Record<string, string> = {
	json: 'application/json',
};

const OUTPUT_FILE_EXTENSIONS: Record<string, string> = {
	json: 'json',
};

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
			const exampleOutput = parseJsonIfString(this.getNodeParameter('example_output', i));
			const outputFormat = this.getNodeParameter('output_format', i) as string;

			const fileId = await uploadInputBinary.call(this, i, binaryPropertyName, {
				filename: 'input',
				mimeType: 'application/octet-stream',
			});

			const jobBody: IDataObject = {
				model,
				file_id: fileId,
				system_prompt: systemPrompt,
				example_output: exampleOutput as IDataObject,
				output_format: outputFormat,
			};
			const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

			const outputBinary = await downloadOutputBinary.call(this, i, SERVICE, completed, {
				defaultFilename: `output.${OUTPUT_FILE_EXTENSIONS[outputFormat] ?? outputFormat}`,
				overrideMimeType: OUTPUT_MIME_TYPES[outputFormat],
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
