import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import {
	createAndPollJob,
	downloadOutputBinary,
	handleItemError,
	uploadInputBinary,
} from '../../shared/job';

const SERVICE = { basePath: '/renderocr', label: 'RenderOCR' };

const OUTPUT_MIME_TYPES: Record<string, string> = {
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
			const languages = this.getNodeParameter('languages', i) as string[];
			const outputFormat = this.getNodeParameter('output_format', i) as string;

			const fileId = await uploadInputBinary.call(this, i, binaryPropertyName, {
				filename: 'input.pdf',
				mimeType: 'application/octet-stream',
			});

			const jobBody: IDataObject = {
				file_id: fileId,
				engine,
				languages,
				output_format: outputFormat,
			};
			const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

			const outputBinary = await downloadOutputBinary.call(this, i, SERVICE, completed, {
				defaultFilename: `output.${outputFormat}`,
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
