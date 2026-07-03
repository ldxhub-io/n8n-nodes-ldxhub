import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type Model = {
	id: string;
	provider?: string;
	display_name?: string;
	description?: string;
	supported_conversions?: unknown;
	supported_languages?: unknown;
};

type ModelsResponse = {
	data?: Model[];
};

export async function getAnalyzeDocModels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/analyzedoc/models',
	)) as ModelsResponse;

	const models = response.data ?? [];

	return models.map((m) => ({
		name: m.display_name ?? m.id,
		value: m.id,
		description: m.description,
	}));
}
