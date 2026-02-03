import grpc
from concurrent import futures
import fraud_detection_pb2
import fraud_detection_pb2_grpc

class FraudDetectionService(fraud_detection_pb2_grpc.FraudDetectionServiceServicer):
    def DetectFraud(self, request, context):
        print(f"Received transaction: {request.transaction_id}")
        
        # PLACEHOLDER: ML model prediction
        prediction = self.predict_fraud(request)
        
        return fraud_detection_pb2.FraudResponse(
            is_fraud=prediction['is_fraud'],
            risk_score=prediction['risk_score'],
            fraud_reason_unusual_amount=prediction['unusual_amount'],
            fraud_reason_geo_distance_anomaly=prediction['geo_anomaly'],
            fraud_reason_high_velocity=prediction['high_velocity'],
            fraud_severity=prediction['severity'],
            flag_color=prediction['flag_color'],
            reason_of_fraud=prediction['reason']
        )
    
    def predict_fraud(self, request):
        """
        PLACEHOLDER: Replace with actual ML model
        
        This is where you would:
        1. Load your trained ML model
        2. Extract features from the request
        3. Make predictions
        4. Return fraud detection results
        """
        risk_score = 0.0
        reasons = []
        
        # Simple rule-based logic for demonstration
        if request.amount_value > 50000:
            risk_score += 0.3
            reasons.append('High transaction amount')
        
        if request.sender_txn_count_1min >= 5:
            risk_score += 0.4
            reasons.append('High transaction velocity')
        
        if request.ip_risk == 'HIGH':
            risk_score += 0.3
            reasons.append('High IP risk')
        
        if request.merchant_risk_level == 'HIGH':
            risk_score += 0.2
            reasons.append('High-risk merchant')
            
        is_fraud = risk_score >= 0.65
        
        return {
            'is_fraud': is_fraud,
            'risk_score': min(risk_score, 1.0),
            'unusual_amount': request.amount_value > 50000,
            'geo_anomaly': False,
            'high_velocity': request.sender_txn_count_1min >= 5,
            'severity': 'HIGH' if risk_score >= 0.8 else ('MEDIUM' if risk_score >= 0.5 else 'LOW'),
            'flag_color': 'RED' if is_fraud else 'GREEN',
            'reason': '; '.join(reasons) if reasons else 'No fraud detected by ML model'
        }

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    fraud_detection_pb2_grpc.add_FraudDetectionServiceServicer_to_server(
        FraudDetectionService(), server
    )
    server.add_insecure_port('[::]:50051')
    server.start()
    print("✅ gRPC ML server started on port 50051")
    print("📊 Waiting for fraud detection requests...")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
