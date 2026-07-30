pipeline {
    agent any

    environment {
        IMAGE_NAME = 'aaditidigra7483/task-tracker-api'
        BUILD_TAG = "v1.0.${BUILD_NUMBER}"
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker Image: ${IMAGE_NAME}:${BUILD_TAG}"
                    sh "docker build -t ${IMAGE_NAME}:${BUILD_TAG} ."
                    sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "Pushing image to Docker Hub..."
                    sh "echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin"
                    sh "docker push ${IMAGE_NAME}:${BUILD_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "Deploying to Kubernetes..."
                    sh "kubectl apply -f k8s-manifests.yaml --insecure-skip-tls-verify=true"
                    sh "kubectl rollout status deployment/task-tracker-api --insecure-skip-tls-verify=true"
                }
            }
        }
    }

    post {
        always {
            sh "docker logout || true"
        }
        success {
            echo "Pipeline succeeded!"
        }
        failure {
            echo "Pipeline failed. Check build logs."
        }
    }
}