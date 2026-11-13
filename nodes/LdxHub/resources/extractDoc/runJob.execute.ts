import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import {
	createAndPollJob,
	downloadOutputBinary,
	handleItemError,
	uploadInputBinary,
} from '../../shared/job';

const SERVICE = { basePath: '/extractdoc', label: 'ExtractDoc' };

const OUTPUT_MIME_TYPES: Record<string, string> = {
	text: 'text/plain; charset=utf-8',
	jsonl: 'application/jsonl',
};

const OUTPUT_FILE_EXTENSIONS: Record<string, string> = {
	text: 'txt',
	jsonl: 'jsonl',
};

export async function runJobExecute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const engine = this.getNodeParameter('engine', i) as string;
			const outputFormat = this.getNodeParameter('output_format', i) as string;

			const fileId = await uploadInputBinary.call(this, i, binaryPropertyName, {
				filename: 'input',
				mimeType: 'application/octet-stream',
			});

			const jobBody: IDataObject = {
				engine,
				file_id: fileId,
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
					status: completed.job.status,
					output_file_id: completed.job.output_file_id,
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
