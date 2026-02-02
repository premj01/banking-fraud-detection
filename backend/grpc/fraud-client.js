import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROTO_PATH = path.join(__dirname, '../../proto/fraud_detection.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const fraudProto = grpc.loadPackageDefinition(packageDefinition).fraud_detection

class FraudDetectionClient {
    constructor() {
        this.client = new fraudProto.FraudDetectionService(
            'localhost:50051',
            grpc.credentials.createInsecure()
        )
    }

    async detectFraud(transactionData) {
        return new Promise((resolve, reject) => {
            this.client.DetectFraud(transactionData, (error, response) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(response)
                }
            })
        })
    }
}

export default new FraudDetectionClient()
