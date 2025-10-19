export const ciData = [
  {
    input: "What are the new features in Python 3.12?",
    expected: "Python 3.12 includes improved f-string syntax, performance improvements with per-interpreter GIL, better error messages, and new typing features including generic type aliases.",
  },
  {
    input: "How do I optimize database queries in PostgreSQL?",
    expected: "PostgreSQL query optimization includes using proper indexes, analyzing query execution plans with EXPLAIN, avoiding N+1 queries, using connection pooling, and optimizing JOIN operations.",
  },
  {
    input: "What is the difference between Docker and Kubernetes?",
    expected: "Docker is a containerization platform for packaging applications, while Kubernetes is a container orchestration system for managing Docker containers at scale across multiple hosts.",
  },
  {
    input: "Explain the benefits of using Redis for caching",
    expected: "Redis provides in-memory caching with sub-millisecond latency, supports complex data structures, offers persistence options, provides high availability through clustering, and supports pub/sub messaging.",
  },
  {
    input: "What are the key principles of microservices architecture?",
    expected: "Microservices architecture principles include single responsibility, decentralized governance, failure isolation, technology diversity, data decentralization, and design for failure.",
  },
  {
    input: "How does GraphQL differ from REST APIs?",
    expected: "GraphQL allows clients to request exactly the data they need, uses a single endpoint, provides strong type system, and enables real-time subscriptions, while REST uses multiple endpoints and may over-fetch data.",
  },
  {
    input: "What are the main security considerations for web applications?",
    expected: "Web application security includes protecting against XSS, CSRF, SQL injection, implementing proper authentication and authorization, using HTTPS, input validation, and secure session management.",
  },
  {
    input: "Explain the concept of CI/CD pipelines",
    expected: "CI/CD pipelines automate code integration, testing, and deployment processes. Continuous Integration merges code frequently with automated testing, while Continuous Deployment automatically releases validated changes to production.",
  },
];