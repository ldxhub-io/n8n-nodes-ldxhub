import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForCastVoice = {
	resource: ['castVoice'],
};

export const castVoiceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCastVoice,
		},
		options: [
			{
				name: 'Run Transcription Job',
				value: 'runJob',
				action: 'Run a transcription job',
				description: 'Transcribe the speech in an audio file to plain text or SRT subtitles',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
