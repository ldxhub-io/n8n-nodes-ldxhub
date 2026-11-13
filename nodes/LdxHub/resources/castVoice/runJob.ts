import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['castVoice'],
	operation: ['runJob'],
};

export const runJobFields: INodeProperties[] = [
	// ---------- Main parameters ----------
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description:
			'Name of the binary property from the previous node that contains the audio file. The accepted formats come from the selected engine (WAV and MP3 at present). The transcript replaces it.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Engine Name or ID',
		name: 'engine',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCastVoiceEngines',
		},
		required: true,
		default: '',
		description:
			'CastVoice engine to use. Click to load available engines from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Recognizer Name or ID',
		name: 'recognizer',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCastVoiceRecognizers',
			loadOptionsDependsOn: ['engine'],
		},
		required: true,
		default: '',
		description:
			'Language (and, for some engines, model) of the speech. Options depend on the selected engine. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Output Format Name or ID',
		name: 'output_format',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCastVoiceOutputFormats',
			loadOptionsDependsOn: ['engine'],
		},
		required: true,
		default: '',
		description:
			'TEXT for plain text, SRT for subtitles with timecodes. Options depend on the selected engine. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
				displayName: 'Split by Sentence',
				name: 'splitBySentence',
				type: 'boolean',
				default: false,
				description:
					'Whether to split each recognized segment at sentence boundaries where possible, with timecodes rebuilt from word timestamps. Only for engines that list split_by_sentence.',
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
