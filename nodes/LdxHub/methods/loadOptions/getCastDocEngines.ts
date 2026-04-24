import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type Engine = {
	id: string;
	provider?: string;
	display_name?: string;
	description?: string;
	supported_conversions?: unknown;
};

type EnginesResponse = {
	data?: Engine[];
};

export async function getCastDocEngines(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/castdoc/engines',
	)) as EnginesResponse;

	const engines = response.data ?? [];

	return engines.map((e) => ({
		name: e.display_name ?? e.id,
		value: e.id,
		description: e.description,
	}));
}
