import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['analyzeDoc'],
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
			'Name of the binary property from the previous node that contains the PDF or image to analyze',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Model Name or ID',
		name: 'model',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAnalyzeDocModels',
		},
		required: true,
		default: '',
		description:
			'Vision AI model for analysis. Click to load available models from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
			'Instruction describing what structured data to extract from the document and how',
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
		displayName: 'Output Format Name or ID',
		name: 'output_format',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAnalyzeDocOutputFormats',
			loadOptionsDependsOn: ['model'],
		},
		required: true,
		default: '',
		description:
			'Output file format. Options depend on the selected model. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
