import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { uploadFile } from '../../shared/files';
import {
	createAndPollJob,
	downloadOutputBinary,
	handleItemError,
	uploadInputBinary,
} from '../../shared/job';
import type { VoiceEngine } from '../../shared/voice';
import { assertVoiceJobSupported, detectInputFormat, getVoiceEngines } from '../../shared/voice';

const SERVICE = { basePath: '/rendervoice', label: 'RenderVoice' };

const OUTPUT_MIME_TYPES: Record<string, string> = {
	wave: 'audio/wav',
};

const OUTPUT_FILE_EXTENSIONS: Record<string, string> = {
	wave: 'wav',
};

type RenderVoiceOptions = {
	speakingRate?: number;
};

export async function runJobExecute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	let engines: VoiceEngine[] | undefined;

	for (let i = 0; i < items.length; i++) {
		try {
			const inputMode = this.getNodeParameter('inputMode', i) as 'text' | 'binary';
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const engine = this.getNodeParameter('engine', i) as string;
			const locale = this.getNodeParameter('locale', i) as string;
			const voice = this.getNodeParameter('voice', i) as string;
			const outputFormat = this.getNodeParameter('output_format', i) as string;
			const options = this.getNodeParameter('options', i, {}) as RenderVoiceOptions;

			engines ??= await getVoiceEngines.call(this, 'rendervoice');
			const engineInfo = engines.find((e) => e.id === engine);
			const checkedOptions = options.speakingRate !== undefined ? ['speaking_rate'] : [];

			let fileId: string;
			if (inputMode === 'text') {
				const text = this.getNodeParameter('text', i) as string;
				if (!text || text.trim().length === 0) {
					throw new NodeOperationError(this.getNode(), 'Text is empty', { itemIndex: i });
				}
				assertVoiceJobSupported.call(this, i, SERVICE.label, engineInfo, {
					inputFormat: 'text',
					outputFormat,
					options: checkedOptions,
				});
				const upload = await uploadFile.call(
					this,
					Buffer.from(text, 'utf8'),
					'speech.txt',
					'text/plain; charset=utf-8',
				);
				fileId = upload.file_id;
			} else {
				const binaryMeta = this.helpers.assertBinaryData(i, binaryPropertyName);
				assertVoiceJobSupported.call(this, i, SERVICE.label, engineInfo, {
					inputFormat: detectInputFormat(binaryMeta),
					outputFormat,
					options: checkedOptions,
				});
				fileId = await uploadInputBinary.call(this, i, binaryPropertyName, {
					filename: 'input.txt',
					mimeType: 'text/plain',
				});
			}

			const jobBody: IDataObject = {
				engine,
				file_id: fileId,
				locale,
				voice,
				output_format: outputFormat,
			};
			if (options.speakingRate !== undefined) {
				jobBody.speaking_rate = options.speakingRate;
			}
			const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

			const outputBinary = await downloadOutputBinary.call(this, i, SERVICE, completed, {
				defaultFilename: `speech.${OUTPUT_FILE_EXTENSIONS[outputFormat] ?? outputFormat}`,
				overrideMimeType: OUTPUT_MIME_TYPES[outputFormat],
			});

			returnData.push({
				json: {
					job_id: completed.jobId,
					engine,
					locale,
					voice,
					status: completed.job.status,
					output_file_id: completed.job.output_file_id,
					usage: completed.job.usage as IDataObject | undefined,
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
