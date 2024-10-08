export type Logger = {
  info?: (message: string) => void,
  warn?: (message: string) => void,
  error?: (message: string) => void
  debug?: (message: string) => void
};

export enum LogLevel {
  Info = 1 << 0,
  Warn = 1 << 1,
  Error = 1 << 2,
  Debug = 1 << 3
}

export enum LogType {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug"
}

export class ConsoleLogger implements Logger {
  public info(message: string): void {
      this.log(LogType.Info, message);
  }

  public warn(message: string): void {
      this.log(LogType.Warn, message);
  }

  public error(message: string): void {
      this.log(LogType.Error, message);
  }

  public debug(message: string): void {
      this.log(LogType.Debug, message);
  }

  private log(type: LogType, message: string): void {
      // @ts-ignore-start
      console[type](`[MCC.JS][${this.capitalize(type)}] ${message}`);
      // @ts-ignore-end
  }

  private capitalize(message: string): string {
      return message.charAt(0).toUpperCase() + message.substring(1).toLowerCase();
  }
}
