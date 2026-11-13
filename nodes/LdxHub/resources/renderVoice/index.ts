import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForRenderVoice = {
	resource: ['renderVoice'],
};

export const renderVoiceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRenderVoice,
		},
		options: [
			{
				name: 'Run Speech Synthesis Job',
				value: 'runJob',
				action: 'Run a speech synthesis job',
				description: 'Turn text into speech audio with the selected voice',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
