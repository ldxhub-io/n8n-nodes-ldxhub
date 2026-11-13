import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import {
	createAndPollJob,
	downloadOutput,
	handleItemError,
	uploadInputBinary,
} from '../../shared/job';
import type { VoiceEngine } from '../../shared/voice';
import { assertVoiceJobSupported, detectInputFormat, getVoiceEngines } from '../../shared/voice';

const SERVICE = { basePath: '/castvoice', label: 'CastVoice' };

const OUTPUT_MIME_TYPES: Record<string, string> = {
	text: 'text/plain; charset=utf-8',
	srt: 'application/x-subrip',
};

const OUTPUT_FILE_EXTENSIONS: Record<string, string> = {
	text: 'txt',
	srt: 'srt',
};

type CastVoiceOptions = {
	splitBySentence?: boolean;
};

export async function runJobExecute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	let engines: VoiceEngine[] | undefined;

	for (let i = 0; i < items.length; i++) {
		try {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const engine = this.getNodeParameter('engine', i) as string;
			const recognizer = this.getNodeParameter('recognizer', i) as string;
			const outputFormat = this.getNodeParameter('output_format', i) as string;
			const options = this.getNodeParameter('options', i, {}) as CastVoiceOptions;

			const binaryMeta = this.helpers.assertBinaryData(i, binaryPropertyName);
			engines ??= await getVoiceEngines.call(this, 'castvoice');
			assertVoiceJobSupported.call(
				this,
				i,
				SERVICE.label,
				engines.find((e) => e.id === engine),
				{
					inputFormat: detectInputFormat(binaryMeta),
					outputFormat,
					options: options.splitBySentence ? ['split_by_sentence'] : [],
				},
			);

			const fileId = await uploadInputBinary.call(this, i, binaryPropertyName, {
				filename: 'input.wav',
				mimeType: 'application/octet-stream',
			});

			const jobBody: IDataObject = {
				engine,
				file_id: fileId,
				recognizer,
				output_format: outputFormat,
			};
			if (options.splitBySentence !== undefined) {
				jobBody.split_by_sentence = options.splitBySentence;
			}
			const completed = await createAndPollJob.call(this, i, SERVICE, jobBody);

			const output = await downloadOutput.call(this, i, SERVICE, completed, {
				defaultFilename: `transcript.${OUTPUT_FILE_EXTENSIONS[outputFormat] ?? outputFormat}`,
				overrideMimeType: OUTPUT_MIME_TYPES[outputFormat],
			});
			const outputBinary = await this.helpers.prepareBinaryData(
				output.buffer,
				output.filename,
				output.mimeType,
			);

			const json: IDataObject = {
				job_id: completed.jobId,
				engine,
				recognizer,
				status: completed.job.status,
				output_file_id: completed.job.output_file_id,
				usage: completed.job.usage as IDataObject | undefined,
			};
			if (outputFormat === 'text') {
				json.text = output.buffer.toString('utf8');
			}

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
