import ResponseFormatter from "../../../shared/utils/responseFormatter.js";

/**
 * ClientController class to handle client related requests
 */
export class ClientController {
     /**
     * Constructor for ClientController
     * @param {Object} clientService 
     * @param {Object} authService 
     */
    constructor(clientService, authService) {
        // Validate dependencies
        if(!clientService) {
            throw new Error("ClientService is required for ClientController.");
        }

        if(!authService) {
            throw new Error("AuthService is required for ClientController.");
        }

        this.clientService = clientService;
        this.authService = authService;
    }

    /**
     * Create a new client, only accessible by super admins
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with created client data or error message
    */
    async createClient(req, res, next) {
        try {
            const isSuperAdmin = await this.authService.checkSuperAdminPermissions(req.user.userId);
            if(!isSuperAdmin) {
                return res.status(403).json(ResponseFormatter.error("Forbidden: You do not have permission to create a client.", 403));        
            }

            const client = await this.clientService.createClient(req.body, req.user);
            return res.status(201).json(ResponseFormatter.success(client, "Client created successfully", 201));
        } catch(error) {
            next(error);
        }
    }

    /**
     * Create a new user for a client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with created user data or error message
     */
    async createClientUser(req, res, next) {
        try {
            const { clientId} = req.params;
            const user = await this.clientService.createClientUser(clientId, req.body, req.user);
            return res.status(201).json(ResponseFormatter.success(user, "Client user created successfully", 201));
        } catch( error ) {
            next(error);
        }
    }

    /**
     * Create a new API key for a client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with created API key data or error message
     */
    async createClientApiKey(req, res, next) {
        try {
            const { clientId} = req.params;
            const apiKey = await this.clientService.createClientApiKey(clientId, req.body, req.user);
            return res.status(201).json(ResponseFormatter.success(apiKey, "Client API key created successfully", 201));
        } catch( error ) {
            next(error);
        }
    }


    /**
     * Get all API keys for a client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with retrieved API keys or error message
     */
    async getClientApiKeys(req, res, next) {
        try {
            const { clientId} = req.params;
            const apiKeys = await this.clientService.getClientApiKeys(clientId, req.user);
            return res.status(200).json(ResponseFormatter.success(apiKeys, "Client API keys retrieved successfully", 200));
        } catch( error ) {
            next(error);
        }
    }

    /**
     * List all clients (super admin only).
     */
    async listClients(req, res, next) {
        try {
            const isSuperAdmin = await this.authService.checkSuperAdminPermissions(req.user.userId);
            if (!isSuperAdmin) {
                return res.status(403).json(ResponseFormatter.error("Forbidden: insufficient permissions.", 403));
            }
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
            const page = parseInt(req.query.page, 10) || 1;
            const skip = (page - 1) * limit;
            const { clients, total } = await this.clientService.listClients({ limit, skip });
            return res.status(200).json(ResponseFormatter.paginated(clients, page, limit, total));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single client by ID (super admin only).
     */
    async getClient(req, res, next) {
        try {
            const { clientId } = req.params;
            if (!this.clientService.canUserAccessClient(req.user, clientId)) {
                return res.status(403).json(ResponseFormatter.error("Forbidden: insufficient permissions.", 403));
            }
            const client = await this.clientService.getClient(clientId);
            return res.status(200).json(ResponseFormatter.success(client, "Client retrieved successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * List users of a client (super admin, or client admin/viewer of that client).
     */
    async listClientUsers(req, res, next) {
        try {
            const users = await this.clientService.listClientUsers(req.params.clientId, req.user);
            return res.status(200).json(ResponseFormatter.success(users, "Client users retrieved successfully", 200));
        } catch (error) {
            next(error);
        }
    }
}