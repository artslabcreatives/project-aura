<?php

use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/auraai', \App\Mcp\Servers\AuraAIServer::class);
