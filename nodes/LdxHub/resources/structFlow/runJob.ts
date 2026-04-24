import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['structFlow'],
	operation: ['runJob'],
};

const showOnlyForInline = {
	...showOnlyForRunJob,
	inputMode: ['inline'],
};

const showOnlyForBinary = {
	...showOnlyForRunJob,
	inputMode: ['binary'],
};

export const runJobFields: INodeProperties[] = [
	// ---------- Common parameters ----------
	{
		displayName: 'Model Name or ID',
		name: 'model',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStructFlowModels',
		},
		required: true,
		default: '',
		description:
			'AI model for extraction. Click to load available models from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'System Prompt',
		name: 'system_prompt',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		description:
			'Instruction describing what structured data to extract and how',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Example Output',
		name: 'example_output',
		type: 'json',
		required: true,
		default: '{}',
		description:
			'A JSON object showing the desired output structure with example values',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Inline Inputs',
				value: 'inline',
				description: 'Provide ID+Data pairs directly in the workflow',
			},
			{
				name: 'Binary File',
				value: 'binary',
				description: 'Upload a JSONL file from binary input',
			},
		],
		default: 'inline',
		description:
			'How to provide input data. Inline for small batches (JSON records directly in workflow). Binary File for large JSONL batches (uploaded to LDXhub before job submission).',
		displayOptions: { show: showOnlyForRunJob },
	},

	// ---------- Inline mode ----------
	{
		displayName: 'Inputs',
		name: 'inputs',
		type: 'fixedCollection',
		placeholder: 'Add Input',
		required: true,
		default: {},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: { show: showOnlyForInline },
		options: [
			{
				name: 'input',
				displayName: 'Input',
				values: [
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						description: 'Unique identifier for this input record',
					},
					{
						displayName: 'Data',
						name: 'data',
						type: 'json',
						required: true,
						default: '{}',
						description:
							'Input data as key-value pairs. Keys should match the fields referenced in system_prompt.',
					},
				],
			},
		],
	},

	// ---------- Binary File mode ----------
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description:
			'Name of the binary property from the previous node that contains the JSONL file (one JSON record per line)',
		displayOptions: { show: showOnlyForBinary },
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
