import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getModels } from './methods/loadOptions/getModels';
import { refineLoopDescription } from './resources/refineLoop';
import { runJobExecute } from './resources/refineLoop/runJob.execute';

export class LdxHub implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LDXhub',
		name: 'ldxHub',
		icon: { light: 'file:../../icons/ldxhub.svg', dark: 'file:../../icons/ldxhub.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Work with the LDXhub AI-powered document processing platform',
		defaults: {
			name: 'LDXhub',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'ldxHubApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://gw.ldxhub.io',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'RefineLoop',
						value: 'refineLoop',
					},
				],
				default: 'refineLoop',
			},
			...refineLoopDescription,
		],
	};

	methods = {
		loadOptions: {
			getModels,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (resource === 'refineLoop' && operation === 'runJob') {
			return runJobExecute.call(this, items);
		}

		throw new NodeOperationError(
			this.getNode(),
			`Operation "${resource}.${operation}" is not supported`,
		);
	}
}
