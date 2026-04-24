import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForCastDoc = {
	resource: ['castDoc'],
};

export const castDocDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCastDoc,
		},
		options: [
			{
				name: 'Run Conversion Job',
				value: 'runJob',
				action: 'Run a conversion job',
				description:
					'Convert a text-based PDF to Word/Excel/PowerPoint without OCR',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
