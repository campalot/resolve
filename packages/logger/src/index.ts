const COLORS = {
  operation: "#8b5cf6", // Purple
  security: "#f59e0b",  // Amber
  storage: "#10b981",   // Emerald
  sideEffect: "#3b82f6", // Blue
  latency: "#64748b", // Gray
  error: "#dc3545", // Error
};

let startTime: number | null = null;

export const backendLogger = {
  startGroup: <T>(opName: string, variables: T) => {
    console.group(`%c[GraphQL] ${opName}`, `color: ${COLORS.operation}; font-weight: bold;`);
    console.log("%cVariables:", "color: #94a3b8", variables);
  },
  
  security: (role: string, action: string, allowed: boolean) => {
    if (allowed) {
      console.log(`%c[RBAC] Permission granted for '${action}' as '${role}'`, `color: ${COLORS.storage}`);
    } else {
      console.warn(`%c[RBAC] ACCESS DENIED: '${role}' cannot perform '${action}'`, `color: ${COLORS.security}; font-weight: bold`);
    }
  },

  error: (msg: string) => {
    console.log(`%c[Error] ${msg}`, `color: ${COLORS.error}; font-style: italic;`);
  },

  sideEffect: <T>(msg: string, data?: T) => {
    console.log(`%c[Side-Effect] ${msg}`, `color: ${COLORS.sideEffect}`, data || "");
  },

  storage: (msg: string) => {
    console.log(`%c[Storage] ${msg}`, `color: ${COLORS.storage}; font-style: italic;`);
  },

  latencyStart: (ms: number) => {
    startTime = performance.now();
    console.log(`%c[Network] Simulating ${ms}ms latency...`, `color: ${COLORS.latency}; font-style: italic;`);
  },

  latencyEnd: (status: number = 200) => {
    const duration = startTime ? (performance.now() - startTime).toFixed(0) : "unknown";
    const statusColor = status >= 400 ? "#ef4444" : "#10b981"; // Red for errors, Green for OK
    
    console.log(
      `%c[Network] Response delivered in ${duration}ms %c(${status})`, 
      `color: ${COLORS.latency}; font-style: italic;`,
      `color: ${statusColor}; font-weight: bold;`
    );
    startTime = null;
  },

  endGroup: () => console.groupEnd(),
};