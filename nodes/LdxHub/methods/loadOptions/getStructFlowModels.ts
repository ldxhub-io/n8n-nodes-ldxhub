import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type ModelItem = {
	id: string;
	display_name?: string;
	description?: string;
	provider?: string;
};

type ModelsResponse = {
	data?: ModelItem[];
};

export async function getStructFlowModels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/structflow/models',
	)) as ModelsResponse;

	const models = response.data ?? [];

	return models.map((m) => ({
		name: m.display_name ?? m.id,
		value: m.id,
		description: m.description,
	}));
}
