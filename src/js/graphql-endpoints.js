/**
 * The source URL for the GraphQL endpoint
 */
const GRAPHQL_ENDPOINT_SOURCE_URL = 'https://newapi.getpop.org/api/graphql/';

/**
 * Route the GraphQL endpoint through a CDN
 */
const GRAPHQL_ENDPOINT_CDN_URL = 'https://nextapi.getpop.org/api/graphql/?query=!introspectionQuery&domain=leoloso.com';

/**
 * Options to pass the CDN
 */
const GRAPHQL_ENDPOINT_CDN_OPTIONS = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
};

/**
 * Text to show while in the initial response area
 */
const GRAPHQL_RESPONSE_TEXT = "Click the \"Execute Query\" button";


/**
 * Indicate if the GraphQL query is for introspection
 */
function doingIntrospectionQuery(graphQLParams) {
    return typeof graphQLParams != undefined && graphQLParams.operationName == 'IntrospectionQuery';
}

/**
 * If doing introspection, return the CDN, otherwise the endpoint source
 */
function getGraphQLEndpointURL(graphQLParams, extraParams) {
    return doingIntrospectionQuery(graphQLParams) ?
        GRAPHQL_ENDPOINT_CDN_URL + (extraParams ? '&' + extraParams : '')
        : GRAPHQL_ENDPOINT_SOURCE_URL + (extraParams ? '?' + extraParams : '');
}

/**
 * If doing introspection, return GET, otherwise POST and the params
 */
function getGraphQLOptions(graphQLParams, credentials) {
    return doingIntrospectionQuery(graphQLParams) ? GRAPHQL_ENDPOINT_CDN_OPTIONS : getGraphQLOptionsForSource(graphQLParams, credentials);
}

/**
 * If doing introspection, return GET, otherwise POST and the params
 */
function getGraphQLOptionsForSource(graphQLParams, credentials) {
    return {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphQLParams),
        credentials: credentials || 'omit',
    };
}