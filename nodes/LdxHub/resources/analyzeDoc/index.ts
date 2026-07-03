import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForAnalyzeDoc = {
	resource: ['analyzeDoc'],
};

export const analyzeDocDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAnalyzeDoc,
		},
		options: [
			{
				name: 'Run Analysis Job',
				value: 'runJob',
				action: 'Run an analysis job',
				description:
					'Upload a PDF or image and extract structured JSON with a vision AI model',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
