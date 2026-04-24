import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForStructFlow = {
	resource: ['structFlow'],
};

export const structFlowDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForStructFlow,
		},
		options: [
			{
				name: 'Run Extraction Job',
				value: 'runJob',
				action: 'Run an extraction job',
				description:
					'Extract structured JSON from unstructured text using an AI model',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
