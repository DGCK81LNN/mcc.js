import {
    ItemType, 
    Hand, 
    InteractType, 
    EntityActionType, 
    Direction, 
    CommandBlockFlags, 
    CommandBlockMode, 
    WindowActionType
} from "./MccTypes";

export class Command {
    private name: string;
    private requestId: string;

    constructor(name: string) {
        this.name = name;
        this.requestId = Command.randomRequestId();
    }

    private getParameters(): Array<any> {
        const parameters: Array<any> = [];

        Object.entries(this).forEach(entry => {
            const properyName: string = entry[0];
            const properyValue: any = entry[1];

            if (properyName === 'name' || properyName === 'requestId')
                return;

            parameters.push(properyValue);
        });

        return parameters;
    }

    public getRequestId(): string {
        return this.requestId;
    }

    public getCommandJson(): string {
        return JSON.stringify({
            command: this.name,
            requestId: this.requestId,
            parameters: this.getParameters()
        });
    }

    private static randomRequestId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < 20; i++)
            result += chars.charAt(Math.floor(Math.random() * chars.length));

        return result;
    }
}

export class AuthenticateCommand extends Command {
    constructor(public password: string) {
        super("Authenticate");
    }
}

export class ChangeSessionIdCommand extends Command {
    constructor(public sessionId: string) {
        super("ChangeSessionId");
    }
}

export class ChangeSlotCommand extends Command {
    constructor(public slotId: number) {
        super("ChangeSlot");
    }
}

export class ClearInventoriesCommand extends Command {
    constructor() {
        super("ClearInventories");
    }
}

export class ClientIsMovingCommand extends Command {
    constructor() {
        super("ClientIsMoving");
    }
}

export class CloseInventoryCommand extends Command {
    constructor(public windowId: number) {
        super("CloseInventory");
    }
}

export class CreativeDeleteCommand extends Command {
    constructor(public slot: number) {
        super("CreativeDelete");
    }
}

export class CreativeGiveCommand extends Command {
    constructor(
        public slot: number,
        public itemType: ItemType,
        public count: number
    ) {
        super("CreativeGive");
    }
}

export class DigBlockCommand extends Command {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public swingArms: boolean,
        public lookAtBlock: boolean) {
        super("DigBlock");
    }
}

export class DisconnectAndExitCommand extends Command {
    constructor() {
        super("DisconnectAndExit");
    }
}

export class GetCurrentLocationCommand extends Command {
    constructor() {
        super("GetCurrentLocation");
    }
}

export class GetCurrentSlotCommand extends Command {
    constructor() {
        super("GetCurrentSlot");
    }
}

export class GetEntitiesCommand extends Command {
    constructor() {
        super("GetEntities");
    }
}

export class GetEntityHandlingEnabledCommand extends Command {
    constructor() {
        super("GetEntityHandlingEnabled");
    }
}

export class GetGamemodeCommand extends Command {
    constructor() {
        super("GetGamemode");
    }
}

export class GetInventoriesCommand extends Command {
    constructor() {
        super("GetInventories");
    }
}

export class GetInventoryEnabledCommand extends Command {
    constructor() {
        super("GetInventoryEnabled");
    }
}

export class GetMaxChatMessageLengthCommand extends Command {
    constructor() {
        super("GetMaxChatMessageLength");
    }
}

export class GetOnlinePlayersCommand extends Command {
    constructor() {
        super("GetOnlinePlayers");
    }
}

export class GetOnlinePlayersWithUUIDCommand extends Command {
    constructor() {
        super("GetOnlinePlayersWithUUID");
    }
}

export class GetPitchCommand extends Command {
    constructor() {
        super("GetPitch");
    }
}

export class GetPlayerInventoryCommand extends Command {
    constructor() {
        super("GetPlayerInventory");
    }
}

export class GetPlayersLatencyCommand extends Command {
    constructor() {
        super("GetPlayersLatency");
    }
}

export class GetProtocolVersionCommand extends Command {
    constructor() {
        super("GetProtocolVersion");
    }
}

export class GetServerHostCommand extends Command {
    constructor() {
        super("GetServerHost");
    }
}

export class GetServerPortCommand extends Command {
    constructor() {
        super("GetServerPort");
    }
}

export class GetServerTPSCommand extends Command {
    constructor() {
        super("GetServerTPS");
    }
}

export class GetTerrainEnabledCommand extends Command {
    constructor() {
        super("GetTerrainEnabled");
    }
}

export class GetTimestampCommand extends Command {
    constructor() {
        super("GetTimestamp");
    }
}

export class GetUsernameCommand extends Command {
    constructor() {
        super("GetUsername");
    }
}

export class GetUserUUIDCommand extends Command {
    constructor() {
        super("GetUserUUID");
    }
}

export class GetWorldCommand extends Command {
    constructor() {
        super("GetWorld");
    }
}

export class GetYawCommand extends Command {
    constructor() {
        super("GetYaw");
    }
}

export class InteractEntityCommand extends Command {
    constructor(
        public entityId: number,
        public interactionType: InteractType,
        public hand: Hand
    ) {
        super("InteractEntity");
    }
}

export class LogDebugToConsoleCommand extends Command {
    constructor(public message: string) {
        super("LogDebugToConsole");
    }
}

export class LogDebugToConsoleTranslatedCommand extends Command {
    constructor(public message: string) {
        super("LogDebugToConsoleTranslated");
    }
}

export class LogToConsoleCommand extends Command {
    constructor(public message: string) {
        super("LogToConsole");
    }
}

export class LogToConsoleTranslatedCommand extends Command {
    constructor(public message: string) {
        super("LogToConsoleTranslated");
    }
}

export class LookAtLocationCommand extends Command {
    constructor(
        public x: number,
        public y: number,
        public z: number) {
        super("LookAtLocation");
    }
}

export class MoveToLocationCommand extends Command {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public allowUnsafe: boolean = false,
        public allowDirectTeleport: boolean = false,
        public maxOffset: number = 0,
        public minOfset: number = 0
    ) {
        super("MoveToLocation");
    }
}

export class ReconnectToTheServerCommand extends Command {
    constructor(public extraAttempts: number, public delaySeconds: number) {
        super("ReconnectToTheServer");
    }
}

export class RespawnCommand extends Command {
    constructor() {
        super("Respawn");
    }
}

export class RunScriptCommand extends Command {
    constructor(public scriptName: string) {
        super("RunScript");
    }
}

export class SelectTradeCommand extends Command {
    constructor(public selectedSlot: number) {
        super("SelectTrade");
    }
}

export class SendAnimationCommand extends Command {
    constructor(public hand: Hand = Hand.MainHand) {
        super("SendAnimation");
    }
}

export class SendEntityActionCommand extends Command {
    constructor(public actionType: EntityActionType) {
        super("SendEntityAction");
    }
}

export class SendPlaceBlockCommand extends Command {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public direction: Direction,
        public hand: Hand) {
        super("SendPlaceBlock");
    }
}

export class SetSlotCommand extends Command {
    constructor(public slotId: number) {
        super("SetSlot");
    }
}

export class SetTerrainEnabledCommand extends Command {
    constructor(public enabled: boolean) {
        super("SetTerrainEnabled");
    }
}

export class SneakCommand extends Command {
    constructor(public toggle: boolean) {
        super("Sneak");
    }
}

export class UpdateCommandBlockCommand extends Command {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public command: string,
        public mode: CommandBlockMode,
        public flags: CommandBlockFlags) {
        super("UpdateCommandBlock");
    }
}

export class UpdateSignCommand extends Command {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public line1: string,
        public line2: string,
        public line3: string,
        public line4: string
    ) {
        super("UpdateSign");
    }
}

export class UseItemInHandCommand extends Command {
    constructor() {
        super("UseItemInHand");
    }
}

export class WindowActionCommand extends Command {
    constructor(
        public windowId: number,
        public slotId: number,
        public windowActionType: WindowActionType
    ) {
        super("WindowAction");
    }
}
