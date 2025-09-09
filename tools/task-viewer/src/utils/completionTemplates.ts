export interface TaskCompletionDetails {
  keyAccomplishments: string[];
  implementationDetails: string[];
  technicalChallenges: string[];
  completedAt: Date;
  verificationScore: number;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  summary?: string;
  status: 'pending' | 'in_progress' | 'completed';
  agent?: string;
  createdAt?: Date;
  completedAt?: Date;
  dependencies?: string[];
  notes?: string;
  completionDetails?: TaskCompletionDetails;
}

export interface CompletionTemplate {
  name: string;
  type: 'ui' | 'backend' | 'devops' | 'generic';
  description: string;
  template: string;
}

export function createUITaskTemplate(task: Task): string {
  const timestamp = task.completedAt ? new Date(task.completedAt).toLocaleString() : new Date().toLocaleString();
  
  return `# UI/Frontend Task Completion Report

## 📋 Task Overview
**Task:** ${task.name || 'Unnamed Task'}
**ID:** ${task.id}
**Status:** ✅ Completed
**Completed:** ${timestamp}
${task.agent ? `**Assigned Agent:** ${task.agent}` : ''}

## 🎨 Component Implementation

### Components Created/Modified
${task.summary ? 
`- ${task.summary.split('\n').filter(line => line.trim()).join('\n- ')}` : 
`- [List the UI components created or modified]
- [Include component names and their purposes]
- [Note any reusable components created]`}

### Visual Design Decisions
- **Color Scheme:** [Describe color choices and theme consistency]
- **Typography:** [Font choices and hierarchy]
- **Layout:** [Grid system, spacing, responsive design approach]
- **Interactive Elements:** [Buttons, forms, animations]

## 🎯 User Experience Enhancements

### Interaction Flow
- [Describe user interaction patterns implemented]
- [Note any UX improvements or optimizations]
- [Highlight intuitive navigation features]

### Responsive Design
- **Mobile:** [Mobile-specific adaptations]
- **Tablet:** [Tablet view considerations]
- **Desktop:** [Desktop optimizations]
- **Cross-browser Compatibility:** [Browser support notes]

## ♿ Accessibility Features

### WCAG Compliance
- **ARIA Labels:** [Implemented ARIA attributes]
- **Keyboard Navigation:** [Tab order and keyboard shortcuts]
- **Screen Reader Support:** [Semantic HTML and reader-friendly content]
- **Color Contrast:** [Contrast ratio compliance]

### Performance Metrics
- **Lighthouse Score:** [If available]
- **First Contentful Paint:** [Loading performance]
- **Cumulative Layout Shift:** [Visual stability]

## 🔧 Technical Implementation

### State Management
- **Local State:** [Component-level state handling]
- **Global State:** [Application-wide state management]
- **Data Flow:** [Props, context, or state management library usage]

### CSS/Styling Approach
- **Methodology:** [CSS-in-JS, CSS Modules, Tailwind, etc.]
- **Theming:** [Theme provider implementation]
- **Animations:** [CSS transitions or animation libraries used]

## 🧪 Testing Coverage

### Component Tests
- **Unit Tests:** [Component logic testing]
- **Integration Tests:** [Component interaction testing]
- **Visual Regression:** [Visual consistency checks]
- **Accessibility Tests:** [A11y automated testing]

## 📝 Additional Notes

${task.notes ? task.notes : '[Any special considerations, known issues, or future improvements]'}

## 🔗 Dependencies
${task.dependencies && task.dependencies.length > 0 ? 
task.dependencies.map(dep => `- ${dep}`).join('\n') : 
'No external dependencies'}

---
*This completion report was generated for UI/Frontend task tracking*`;
}

export function createBackendTaskTemplate(task: Task): string {
  const timestamp = task.completedAt ? new Date(task.completedAt).toLocaleString() : new Date().toLocaleString();
  
  return `# Backend/API Task Completion Report

## 📋 Task Overview
**Task:** ${task.name || 'Unnamed Task'}
**ID:** ${task.id}
**Status:** ✅ Completed
**Completed:** ${timestamp}
${task.agent ? `**Assigned Agent:** ${task.agent}` : ''}

## 🚀 API Implementation

### Endpoints Created/Modified
${task.summary ? 
`${task.summary.split('\n').filter(line => line.trim()).join('\n')}` : 
`- **GET** /api/[endpoint] - [Description]
- **POST** /api/[endpoint] - [Description]
- **PUT** /api/[endpoint] - [Description]
- **DELETE** /api/[endpoint] - [Description]`}

### Request/Response Specifications
\`\`\`json
// Request Schema
{
  "field": "type",
  "description": "purpose"
}

// Response Schema
{
  "status": "success/error",
  "data": {},
  "message": "string"
}
\`\`\`

## 🗄️ Database Operations

### Schema Changes
- **Tables Created:** [New database tables]
- **Columns Modified:** [Schema alterations]
- **Indexes Added:** [Performance optimizations]
- **Migrations:** [Migration files created]

### Query Optimizations
- **Query Performance:** [Optimization strategies employed]
- **Caching Strategy:** [Cache implementation details]
- **Connection Pooling:** [Database connection management]

## 🔐 Security Implementation

### Authentication & Authorization
- **Auth Method:** [JWT, OAuth, Session-based, etc.]
- **Role-Based Access:** [RBAC implementation]
- **API Key Management:** [If applicable]

### Security Measures
- **Input Validation:** [Validation rules applied]
- **SQL Injection Prevention:** [Parameterized queries, ORMs]
- **Rate Limiting:** [Request throttling implementation]
- **CORS Configuration:** [Cross-origin settings]
- **Data Encryption:** [Sensitive data handling]

## ⚡ Performance & Scalability

### Performance Metrics
- **Average Response Time:** [Milliseconds]
- **Throughput:** [Requests per second]
- **Database Query Time:** [Query performance stats]

### Scalability Considerations
- **Load Balancing:** [Strategy if applicable]
- **Horizontal Scaling:** [Stateless design considerations]
- **Message Queues:** [Async processing implementation]
- **Caching Layers:** [Redis, Memcached, etc.]

## 🧪 Testing & Quality

### Test Coverage
- **Unit Tests:** [Business logic testing]
- **Integration Tests:** [API endpoint testing]
- **Load Tests:** [Performance testing results]
- **Security Tests:** [Vulnerability scanning]

### Error Handling
- **Error Codes:** [Standardized error responses]
- **Logging:** [Logging strategy and tools]
- **Monitoring:** [APM tools integration]

## 📚 Documentation

### API Documentation
- **OpenAPI/Swagger:** [Spec file location]
- **Postman Collection:** [If available]
- **README Updates:** [Documentation changes]

## 📝 Additional Notes

${task.notes ? task.notes : '[Any special considerations, deployment notes, or configuration requirements]'}

## 🔗 Dependencies
${task.dependencies && task.dependencies.length > 0 ? 
task.dependencies.map(dep => `- ${dep}`).join('\n') : 
'No external dependencies'}

---
*This completion report was generated for Backend/API task tracking*`;
}

export function createDevOpsTemplate(task: Task): string {
  const timestamp = task.completedAt ? new Date(task.completedAt).toLocaleString() : new Date().toLocaleString();
  
  return `# DevOps/Infrastructure Task Completion Report

## 📋 Task Overview
**Task:** ${task.name || 'Unnamed Task'}
**ID:** ${task.id}
**Status:** ✅ Completed
**Completed:** ${timestamp}
${task.agent ? `**Assigned Agent:** ${task.agent}` : ''}

## 🏗️ Infrastructure Changes

### Resources Created/Modified
${task.summary ? 
`${task.summary.split('\n').filter(line => line.trim()).join('\n')}` : 
`- **Compute Resources:** [VMs, containers, serverless functions]
- **Storage:** [Databases, object storage, file systems]
- **Networking:** [VPCs, load balancers, CDN]
- **Security Groups:** [Firewall rules, access policies]`}

## 🔧 Automation & CI/CD

### Pipeline Configuration
- **Build Stage:** [Build process optimizations]
- **Test Stage:** [Automated testing integration]
- **Deploy Stage:** [Deployment strategies]
- **Rollback Strategy:** [Failure recovery procedures]

### Infrastructure as Code
\`\`\`yaml
# Example configuration snippet
service:
  name: example
  environment: production
  resources:
    - type: compute
      specs: {...}
\`\`\`

## 📊 Monitoring & Observability

### Monitoring Setup
- **Metrics Collection:** [Prometheus, CloudWatch, etc.]
- **Log Aggregation:** [ELK stack, CloudWatch Logs, etc.]
- **Distributed Tracing:** [Jaeger, X-Ray, etc.]
- **Dashboards:** [Grafana, Kibana dashboards created]

### Alerting Rules
- **Critical Alerts:** [System failure conditions]
- **Warning Alerts:** [Performance degradation thresholds]
- **Notification Channels:** [Email, Slack, PagerDuty]

## 🔒 Security & Compliance

### Security Hardening
- **Access Control:** [IAM policies, RBAC]
- **Secrets Management:** [Vault, KMS integration]
- **Network Security:** [TLS/SSL, VPN configuration]
- **Vulnerability Scanning:** [Security scan results]

### Compliance Measures
- **Audit Logging:** [Compliance tracking]
- **Data Retention:** [Backup and retention policies]
- **Disaster Recovery:** [DR plan implementation]

## 💰 Cost Optimization

### Resource Optimization
- **Right-sizing:** [Instance type optimizations]
- **Auto-scaling:** [Scaling policies implemented]
- **Reserved Capacity:** [Cost savings through reservations]
- **Unused Resources:** [Cleanup of orphaned resources]

### Cost Analysis
- **Monthly Estimate:** [Projected costs]
- **Cost Savings:** [Optimization impact]
- **Budget Alerts:** [Cost monitoring setup]

## 🚀 Deployment Details

### Environment Configuration
- **Development:** [Dev environment setup]
- **Staging:** [Staging environment configuration]
- **Production:** [Production deployment details]

### Deployment Method
- **Strategy:** [Blue-green, canary, rolling]
- **Rollout Plan:** [Phased deployment approach]
- **Health Checks:** [Service verification]

## 📈 Performance Impact

### System Metrics
- **Availability:** [Uptime improvements]
- **Latency:** [Response time optimization]
- **Throughput:** [Request handling capacity]
- **Error Rate:** [Error reduction achieved]

## 📝 Additional Notes

${task.notes ? task.notes : '[Any special considerations, maintenance procedures, or known limitations]'}

## 🔗 Dependencies
${task.dependencies && task.dependencies.length > 0 ? 
task.dependencies.map(dep => `- ${dep}`).join('\n') : 
'No external dependencies'}

---
*This completion report was generated for DevOps/Infrastructure task tracking*`;
}

export function createGenericTemplate(task: Task): string {
  const timestamp = task.completedAt ? new Date(task.completedAt).toLocaleString() : new Date().toLocaleString();
  
  return `# Task Completion Report

## 📋 Task Overview
**Task:** ${task.name || 'Unnamed Task'}
**ID:** ${task.id}
**Status:** ✅ Completed
**Completed:** ${timestamp}
${task.agent ? `**Assigned Agent:** ${task.agent}` : ''}

## 📝 Task Description

${task.description || '[No description provided]'}

## ✨ Summary of Work Completed

${task.summary ? 
task.summary : 
`### Key Accomplishments
- [List main achievements]
- [Highlight important milestones]
- [Note significant changes made]

### Deliverables
- [List all deliverables produced]
- [Include documentation created]
- [Note any artifacts generated]`}

## 🔍 Implementation Details

### Approach
- **Strategy:** [Describe the approach taken]
- **Tools Used:** [List tools and technologies]
- **Methodology:** [Explain the process followed]

### Technical Specifications
- [Document technical details]
- [Include configuration changes]
- [Note system modifications]

## 🎯 Success Criteria Met

### Acceptance Criteria
- ✅ [Criterion 1 - Met]
- ✅ [Criterion 2 - Met]
- ✅ [Criterion 3 - Met]

### Quality Metrics
- **Completeness:** [Percentage or status]
- **Quality Score:** [If applicable]
- **Performance:** [Metrics achieved]

## 🧪 Validation & Testing

### Testing Performed
- **Functional Testing:** [Test results]
- **Integration Testing:** [System integration verification]
- **User Acceptance:** [UAT results if applicable]

### Issues Resolved
- [List any issues encountered and resolved]
- [Document workarounds implemented]
- [Note any pending issues]

## 📊 Impact Analysis

### Immediate Impact
- [Direct effects of the task completion]
- [System improvements achieved]
- [User benefits realized]

### Long-term Benefits
- [Future advantages]
- [Scalability improvements]
- [Maintenance benefits]

## 📚 Documentation

### Created/Updated
- [List documentation created]
- [Note updated procedures]
- [Include reference materials]

## ⚠️ Important Notes

### Known Limitations
- [Document any constraints]
- [Note temporary solutions]
- [Highlight areas needing attention]

### Future Recommendations
- [Suggest improvements]
- [Recommend next steps]
- [Propose optimizations]

## 📝 Additional Notes

${task.notes ? task.notes : '[Any additional context, observations, or recommendations]'}

## 🔗 Dependencies
${task.dependencies && task.dependencies.length > 0 ? 
task.dependencies.map(dep => `- ${dep}`).join('\n') : 
'No external dependencies'}

---
*This completion report was generated for general task tracking*`;
}

export function detectTaskType(task: Task): 'ui' | 'backend' | 'devops' | 'generic' {
  const combinedText = `${task.name} ${task.description || ''} ${task.agent || ''}`.toLowerCase();
  
  if (combinedText.match(/\b(ui|frontend|react|vue|angular|component|styling|css|html|design|ux|user interface|responsive|accessibility|a11y|layout|theme|animation)\b/)) {
    return 'ui';
  }
  
  if (combinedText.match(/\b(backend|api|server|database|sql|rest|graphql|endpoint|auth|authentication|security|performance|cache|query|migration|schema)\b/)) {
    return 'backend';
  }
  
  if (combinedText.match(/\b(devops|deployment|docker|kubernetes|ci\/cd|pipeline|infrastructure|monitoring|aws|azure|gcp|terraform|ansible|logging|metrics|scaling)\b/)) {
    return 'devops';
  }
  
  return 'generic';
}

export function selectCompletionTemplate(task: Task): string {
  const taskType = detectTaskType(task);
  
  switch (taskType) {
    case 'ui':
      return createUITaskTemplate(task);
    case 'backend':
      return createBackendTaskTemplate(task);
    case 'devops':
      return createDevOpsTemplate(task);
    default:
      return createGenericTemplate(task);
  }
}

export function getTemplateInfo(taskType: 'ui' | 'backend' | 'devops' | 'generic'): CompletionTemplate {
  const templates: Record<string, CompletionTemplate> = {
    ui: {
      name: 'UI/Frontend Template',
      type: 'ui',
      description: 'Specialized template for frontend and UI tasks with sections for components, UX, accessibility, and visual design',
      template: 'Includes: Component implementation, Visual design decisions, User experience, Accessibility features, Performance metrics, Testing coverage'
    },
    backend: {
      name: 'Backend/API Template',
      type: 'backend',
      description: 'Comprehensive template for backend and API tasks with focus on endpoints, database, security, and performance',
      template: 'Includes: API endpoints, Database operations, Security implementation, Performance metrics, Testing, Documentation'
    },
    devops: {
      name: 'DevOps/Infrastructure Template',
      type: 'devops',
      description: 'Detailed template for infrastructure and DevOps tasks covering automation, monitoring, security, and cost optimization',
      template: 'Includes: Infrastructure changes, CI/CD automation, Monitoring setup, Security hardening, Cost optimization, Deployment details'
    },
    generic: {
      name: 'Generic Task Template',
      type: 'generic',
      description: 'Flexible template for general tasks that don\'t fit specific categories, with customizable sections',
      template: 'Includes: Task overview, Implementation details, Success criteria, Testing validation, Impact analysis, Documentation'
    }
  };
  
  return templates[taskType] || templates.generic;
}

export function getAllTemplates(): CompletionTemplate[] {
  return [
    getTemplateInfo('ui'),
    getTemplateInfo('backend'),
    getTemplateInfo('devops'),
    getTemplateInfo('generic')
  ];
}