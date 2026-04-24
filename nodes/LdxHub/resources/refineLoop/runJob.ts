import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRunJob = {
	resource: ['refineLoop'],
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
			'Name of the binary property from the previous node that contains the file to refine',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Model Name or ID',
		name: 'model',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getModels',
		},
		required: true,
		default: '',
		description: 'AI model to use. Click to load available models from LDXhub. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showOnlyForRunJob },
	},
	{
		displayName: 'Max Revisions',
		name: 'maxRevisions',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 10 },
		default: 6,
		description: 'Maximum number of refinement iterations (1-10)',
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
				displayName: 'Custom Instructions',
				name: 'customInstructions',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'Free-form instructions for the AI (e.g., translation style)',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				description:
					'Subject-matter domain hint for the AI (e.g., "medical", "legal", "technical")',
			},
			{
				displayName: 'Exclude Numeric Segments',
				name: 'excludeNumericSegments',
				type: 'boolean',
				default: false,
				description: 'Whether to skip segments that contain only numbers',
			},
			{
				displayName: 'Note Language',
				name: 'noteLanguage',
				type: 'string',
				default: '',
				description: 'Language for AI-generated notes (e.g., "en", "ja", "de")',
			},
			{
				displayName: 'Output Mode',
				name: 'outputMode',
				type: 'options',
				options: [
					{
						name: 'Full',
						value: 'full',
						description: 'Return complete job data',
					},
					{
						name: 'Translations Only',
						value: 'translations',
						description: 'Return only refined translations',
					},
					{
						name: 'None',
						value: 'none',
						description: 'Return only job metadata',
					},
				],
				default: 'full',
				description: 'How much detail to include in the response',
			},
			{
				displayName: 'Remove Hyphenation',
				name: 'removeHyphenation',
				type: 'boolean',
				default: true,
				description: 'Whether to remove hyphenation artifacts from the source',
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
