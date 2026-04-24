import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForRenderOcr = {
	resource: ['renderOcr'],
};

export const renderOcrDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRenderOcr,
		},
		options: [
			{
				name: 'Run Conversion Job',
				value: 'runJob',
				action: 'Run a conversion job',
				description:
					'Upload a PDF or image and convert it to Word/Excel/PowerPoint with OCR',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
