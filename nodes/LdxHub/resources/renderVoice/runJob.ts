import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['renderVoice'],
	operation: ['runJob'],
};

export const runJobFields: INodeProperties[] = [
	// ---------- Input ----------
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Text',
				value: 'text',
				description: 'Type the text here or map it from a previous node',
			},
			{
				name: 'Binary File',
				value: 'binary',
				description: 'Use a plain text file (UTF-8) from a previous node',
			},
		],
		default: 'text',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'Text to read aloud. The maximum length depends on the engine.',
		displayOptions: { show: { ...showOnlyForRunJob, inputMode: ['text'] } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description:
			'Name of the binary property from the previous node that contains the text file. The audio replaces it.',
		displayOptions: { show: { ...showOnlyForRunJob, inputMode: ['binary'] } },
	},
	{
		displayName: 'Output Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property to put the audio file in',
		displayOptions: { show: { ...showOnlyForRunJob, inputMode: ['text'] } },
	},

	// ---------- Main parameters ----------
	{
		displayName: 'Engine Name or ID',
		name: 'engine',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRenderVoiceEngines',
		},
		required: true,
		default: '',
		description:
			'RenderVoice engine to use. Click to load available engines from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Locale Name or ID',
		name: 'locale',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRenderVoiceLocales',
			loadOptionsDependsOn: ['engine'],
		},
		required: true,
		default: '',
		description:
			'Language of the text. Options are the locales of the selected engine\'s voices. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Voice Name or ID',
		name: 'voice',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRenderVoiceVoices',
			loadOptionsDependsOn: ['engine', 'locale'],
		},
		required: true,
		default: '',
		description:
			'Voice to read the text. Options are the selected engine\'s voices for the selected locale. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Output Format Name or ID',
		name: 'output_format',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRenderVoiceOutputFormats',
			loadOptionsDependsOn: ['engine'],
		},
		required: true,
		default: '',
		description:
			'Audio format of the output. Options depend on the selected engine. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},

	// ---------- Options collection ----------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: showOnlyForRunJob },
		options: [
			{
				displayName: 'Speaking Rate',
				name: 'speakingRate',
				type: 'number',
				typeOptions: { minValue: 0.5, maxValue: 2, numberPrecision: 2 },
				default: 1,
				description:
					'Speaking rate as a multiplier of the voice\'s normal speed (for example 1.15 for 15% faster). Only for engines that list speaking_rate.',
			},
		],
	},

	// ---------- Polling Settings collection ----------
	{
		displayName: 'Polling Settings',
		name: 'pollingSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: { show: showOnlyForRunJob },
		options: [
			{
				displayName: 'Max Polling Attempts',
				name: 'pollingMaxAttempts',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 180,
				description:
					'Maximum number of polling attempts before giving up. With default serverWaitSeconds=10 and pollingMaxAttempts=180, maximum wait is about 30 minutes.',
			},
			{
				displayName: 'Server Wait Seconds',
				name: 'serverWaitSeconds',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				default: 10,
				description:
					'Seconds the LDXhub server should wait before responding. Longer values reduce client-side polling frequency.',
			},
		],
	},
];
