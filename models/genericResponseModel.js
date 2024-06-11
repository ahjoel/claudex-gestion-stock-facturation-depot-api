class GenericJsonResponse {
    constructor(status, message, description, data) {
        this.status = status;
        this.message = message;
        this.description = description;
        this.data = data;
    }
}
module.exports = GenericJsonResponse;