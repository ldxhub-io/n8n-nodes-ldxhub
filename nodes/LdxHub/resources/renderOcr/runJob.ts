import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['renderOcr'],
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
			'Name of the binary property from the previous node that contains the file to convert',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Engine Name or ID',
		name: 'engine',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRenderOcrEngines',
		},
		required: true,
		default: '',
		description:
			'OCR engine to use. Click to load available engines from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Languages Names or IDs',
		name: 'languages',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getRenderOcrLanguages',
			loadOptionsDependsOn: ['engine'],
		},
		required: true,
		default: [],
		description:
			'Target languages for OCR. Options depend on the selected engine. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Output Format Name or ID',
		name: 'output_format',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRenderOcrOutputFormats',
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
