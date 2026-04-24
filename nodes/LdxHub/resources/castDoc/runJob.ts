import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['castDoc'],
	operation: ['runJob'],
};

export const runJobFields: INodeProperties[] = [
	// ---------- Main parameters ----------
	{
		displayName: 'Engine Name or ID',
		name: 'engine',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCastDocEngines',
		},
		required: true,
		default: '',
		description:
			'CastDoc engine to use. Click to load available engines from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'File ID',
		name: 'file_id',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of a previously uploaded PDF file (from POST /files)',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Output Format Name or ID',
		name: 'output_format',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCastDocOutputFormats',
			loadOptionsDependsOn: ['engine'],
		},
		required: true,
		default: '',
		description:
			'Output file format. Options depend on the selected engine. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
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
