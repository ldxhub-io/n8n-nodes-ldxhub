import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForRefineLoop = {
	resource: ['refineLoop'],
};

export const refineLoopDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRefineLoop,
		},
		options: [
			{
				name: 'Run Refinement Job',
				value: 'runJob',
				action: 'Run a refinement job',
				description: 'Upload an XLIFF file, run a RefineLoop job, and return the refined file',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
