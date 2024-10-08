import {
    Entity,
    Item,
    ItemType,
    Location,
    EntityActionType,
    InteractType,
    Hand,
    Direction,
    WindowActionType,
    CommandBlockMode,
    CommandBlockFlags,
    ProtocolVersion,
    MapIcon
} from './MccTypes';
import {
    Command,
    DigBlockCommand,
    GetEntitiesCommand,
    GetEntityHandlingEnabledCommand,
    GetPlayersLatencyCommand,
    GetTerrainEnabledCommand,
    GetWorldCommand,
    LogDebugToConsoleCommand,
    LogDebugToConsoleTranslatedCommand,
    LogToConsoleCommand,
    LogToConsoleTranslatedCommand,
    ReconnectToTheServerCommand,
    RunScriptCommand,
    SendEntityActionCommand,
    SetSlotCommand,
    SetTerrainEnabledCommand,
    SneakCommand,
    DisconnectAndExitCommand,
    GetCurrentLocationCommand,
    MoveToLocationCommand,
    ClientIsMovingCommand,
    LookAtLocationCommand,
    GetTimestampCommand,
    GetServerPortCommand,
    GetServerHostCommand,
    GetUsernameCommand,
    GetGamemodeCommand,
    GetYawCommand,
    GetPitchCommand,
    GetUserUUIDCommand,
    GetOnlinePlayersCommand,
    GetOnlinePlayersWithUUIDCommand,
    GetServerTPSCommand,
    InteractEntityCommand,
    CreativeGiveCommand,
    CreativeDeleteCommand,
    SendAnimationCommand,
    SendPlaceBlockCommand,
    UseItemInHandCommand,
    GetInventoryEnabledCommand,
    GetPlayerInventoryCommand,
    GetInventoriesCommand,
    WindowActionCommand,
    ChangeSlotCommand,
    GetCurrentSlotCommand,
    ClearInventoriesCommand,
    UpdateSignCommand,
    SelectTradeCommand,
    UpdateCommandBlockCommand,
    CloseInventoryCommand,
    GetMaxChatMessageLengthCommand,
    RespawnCommand,
    GetProtocolVersionCommand
} from "./Commands";
import { MccJsClient } from './MccJsClient';

export interface CommandResponse {
    requestId: string;
    result: any
}

export class ChatBot {
    protected client?: MccJsClient;
    private responseQueue: Record<string, CommandResponse> = {};
    private promises: Record<string, { resolve: (value: unknown) => void, reject: (reason?: any) => void }> = {};

    public setClient(client: MccJsClient): void {
        this.client = client;
    }

    // Internal
    protected send(text: string): void {
        this.client!.getConnection().send(text);
    }

    private sendCommand<T>(command: Command): Promise<T> {
        this.client!.getConnection().send(command.getCommandJson());

        return new Promise<T>((resolve: (value: T | PromiseLike<T>) => void, reject) => {
            const executionTimeout = this.client!.getExecutionTimeout() * 1000;

            this.promises[command.getRequestId()] = { resolve: resolve as any, reject };

            setTimeout(() => {
                if (this.promises[command.getRequestId()]) {
                    delete this.promises[command.getRequestId()];
                    delete this.responseQueue[command.getRequestId()];
                    reject(new Error(`Command with requestId ${command.getRequestId()} timed out`));
                }
            }, executionTimeout);
        });
    }

    protected info(message: string): void {
        this.client!.info(message);
    }

    protected warn(message: string): void {
        this.client!.warn(message);
    }

    protected error(message: string): void {
        this.client!.error(message);
    }

    protected debug(message: string): void {
        this.client!.debug(message);
    }

    public OnWsCommandResponse(response: any): void {
        if (response.command) {
            if (response.command === 'Authenticate')
                return;
        }

        this.responseQueue[response.requestId] = response as CommandResponse;

        const promise = this.promises[response.requestId];
        if (promise) {
            promise.resolve(this.responseQueue[response.requestId].result);
            delete this.promises[response.requestId];
            delete this.responseQueue[response.requestId];
        }
    }

    public OnEvent(event: string, data: any): void {
        switch (event) {
            case "OnGameJoined":
                this.OnGameJoined();
                break;

            case "OnBlockBreakAnimation":
                this.OnBlockBreakAnimation(data.entity as Entity, data.location as Location, data.stage);
                break;

            case "OnEntityAnimation":
                this.OnEntityAnimation(data.entity as Entity, data.animation);
                break;

            case "OnChatPrivate":
                this.OnChatPrivate(data.sender, data.message, data.rawText);
                break;

            case "OnChatPublic":
                this.OnChatPublic(data.username, data.message, data.rawText);
                break;

            case "OnTeleportRequest":
                this.OnTeleportRequest(data.sender, data.rawText);
                break;

            case "OnChatRaw":
                this.OnChatRaw(data.text, data.json);
                break;

            case "OnDisconnect":
                this.OnDisconnect(data.reason, data.message);
                break;

            case "OnPlayerProperty":
                this.OnPlayerProperty(data);
                break;

            case "OnServerTpsUpdate":
                this.OnServerTpsUpdate(data.tps);
                break;

            case "OnTimeUpdate":
                this.OnTimeUpdate(data.worldAge, data.timeOfDay);
                break;

            case "OnEntityMove":
                this.OnEntityMove(data as Entity);
                break;

            case "OnInternalCommand":
                this.OnInternalCommand(data.command, data.parameters, data.result);
                break;

            case "OnEntitySpawn":
                this.OnEntitySpawn(data as Entity);
                break;

            case "OnEntityDespawn":
                this.OnEntityDespawn(data as Entity);
                break;

            case "OnHeldItemChange":
                this.OnHeldItemChange(data.itemSlot);
                break;

            case "OnHealthUpdate":
                this.OnHealthUpdate(data.health, data.food);
                break;

            case "OnExplosion":
                this.OnExplosion(data.location as Location, data.strength, data.recordCount);
                break;

            case "OnSetExperience":
                this.OnSetExperience(data.experienceBar, data.level, data.totalExperience);
                break;

            case "OnGamemodeUpdate":
                this.OnGamemodeUpdate(data.playerName, data.uuid, data.gameMode);
                break;

            case "OnLatencyUpdate":
                this.OnLatencyUpdate(data.playerName, data.uuid, data.latency);
                break;

            case "OnMapData":
                this.OnMapData(
                    data.mapId,
                    data.scale,
                    data.trackingPosition,
                    data.locked, data.icons as Array<MapIcon>,
                    data.columnsUpdated,
                    data.rowsUpdated,
                    data.mapCoulmnX,
                    data.mapRowZ,
                    data.colors as Array<number>
                );
                break;

            case "OnTradeList":
                this.OnTradeList(data.windowId, data.trades, data.villagerInfo);
                break;

            case "OnTitle":
                this.OnTitle(data.action, data.titleText, data.subtitleText, data.actionBarText, data.fadeIn, data.stay, data.rawJson);
                break;

            case "OnEntityEquipment":
                this.OnEntityEquipment(data.entity as Entity, data.slot, data.item);
                break;

            case "OnEntityEffect":
                this.OnEntityEffect(data.entity as Entity, data.effect, data.amplifier, data.duration, data.flags);
                break;

            case "OnScoreboardObjective":
                this.OnScoreboardObjective(data.objectiveName, data.mode, data.objectiveValue, data.type, data.rawJson);
                break;

            case "OnUpdateScore":
                this.OnUpdateScore(data.entityName, data.action, data.objectiveName, data.type);
                break;

            case "OnInventoryUpdate":
                this.OnInventoryUpdate(data.inventoryId);
                break;

            case "OnInventoryOpen":
                this.OnInventoryOpen(data.inventoryId);
                break;

            case "OnInventoryClose":
                this.OnInventoryClose(data.inventoryId);
                break;

            case "OnPlayerJoin":
                this.OnPlayerJoin(data.uuid, data.name);
                break;

            case "OnPlayerLeave":
                this.OnPlayerLeave(data.uuid, data.name);
                break;

            case "OnDeath":
                this.OnDeath();
                break;

            case "OnRespawn":
                this.OnRespawn();
                break;

            case "OnEntityHealth":
                this.OnEntityHealth(data.entity as Entity, data.health);
                break;

            case "OnEntityMetadata":
                this.OnEntityMetadata(data.entity as Entity, data.metadata);
                break;

            case "OnPlayerStatus":
                this.OnPlayerStatus(data.statusId);
                break;

            case "OnNetworkPacket":
                this.OnNetworkPacket(data.packetId, data.isLogin, data.isInbound, data.packetData);
                break;
        }
    }

    // ChatBot commands
    protected async LogToConsole(message: string): Promise<boolean> {
        return await this.sendCommand<boolean>(new LogToConsoleCommand(message));
    }

    protected async LogDebugToConsole(message: string): Promise<boolean> {
        return await this.sendCommand<boolean>(new LogDebugToConsoleCommand(message));
    }

    protected async LogToConsoleTranslated(message: string): Promise<boolean> {
        return await this.sendCommand<boolean>(new LogToConsoleTranslatedCommand(message));
    }

    protected async LogDebugToConsoleTranslated(message: string): Promise<boolean> {
        return await this.sendCommand<boolean>(new LogDebugToConsoleTranslatedCommand(message));
    }

    protected async ReconnectToTheServer(extraAttempts: number, delaySeconds: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new ReconnectToTheServerCommand(extraAttempts, delaySeconds));
    }

    protected async DisconnectAndExit(): Promise<boolean> {
        return await this.sendCommand<boolean>(new DisconnectAndExitCommand());
    }

    protected async RunScript(scriptName: string): Promise<boolean> {
        return await this.sendCommand<boolean>(new RunScriptCommand(scriptName));
    }

    protected async GetTerrainEnabled(): Promise<boolean> {
        return await this.sendCommand<boolean>(new GetTerrainEnabledCommand());
    }

    protected async SetTerrainEnabled(enabled: boolean): Promise<boolean> {
        return await this.sendCommand<boolean>(new SetTerrainEnabledCommand(enabled));
    }

    protected async GetEntityHandlingEnabled(): Promise<boolean> {
        return await this.sendCommand<boolean>(new GetEntityHandlingEnabledCommand());
    }

    protected async Sneak(toggle: boolean): Promise<boolean> {
        return await this.sendCommand<boolean>(new SneakCommand(toggle));
    }

    protected async SendEntityAction(actionType: EntityActionType): Promise<boolean> {
        return await this.sendCommand<boolean>(new SendEntityActionCommand(actionType));
    }

    protected async DigBlock(location: Location, swingArms: boolean = true, lookAtBlock: boolean = true): Promise<boolean> {
        return await this.sendCommand<boolean>(new DigBlockCommand(location.x, location.y, location.z, swingArms, lookAtBlock));
    }

    protected async SetSlot(slotId: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new SetSlotCommand(slotId));
    }

    protected async GetWorld(): Promise<any> {
        return await this.sendCommand<any>(new GetWorldCommand());
    }

    protected async GetEntities(): Promise<Array<Entity>> {
        return await this.sendCommand<Array<Entity>>(new GetEntitiesCommand());
    }

    protected async GetPlayersLatency(): Promise<Array<any>> {
        return await this.sendCommand<Array<any>>(new GetPlayersLatencyCommand());
    }

    protected async GetCurrentLocation(): Promise<Location> {
        return await this.sendCommand<Location>(new GetCurrentLocationCommand());
    }

    protected async MoveToLocation(
        location: Location,
        allowUnsafe: boolean = false,
        allowDirectTeleport: boolean = false,
        maxOffset: number = 0,
        minOfset: number = 0
    ): Promise<boolean> {
        return await this.sendCommand<boolean>(new MoveToLocationCommand(
            location.x,
            location.y,
            location.z,
            allowUnsafe,
            allowDirectTeleport,
            maxOffset,
            minOfset
        ));
    }

    protected async ClientIsMoving(): Promise<boolean> {
        return await this.sendCommand<boolean>(new ClientIsMovingCommand());
    }

    protected async LookAtLocation(location: Location): Promise<boolean> {
        return await this.sendCommand<boolean>(new LookAtLocationCommand(location.x, location.y, location.z));
    }

    protected async GetTimestamp(): Promise<string> {
        return await this.sendCommand<string>(new GetTimestampCommand());
    }

    protected async GetServerPort(): Promise<number> {
        return await this.sendCommand<number>(new GetServerPortCommand());
    }

    protected async GetServerHost(): Promise<string> {
        return await this.sendCommand<string>(new GetServerHostCommand());
    }

    protected async GetUsername(): Promise<string> {
        return await this.sendCommand<string>(new GetUsernameCommand());
    }

    protected async GetGamemode(): Promise<string> {
        return await this.sendCommand<string>(new GetGamemodeCommand());
    }

    protected async GetYaw(): Promise<number> {
        return await this.sendCommand<number>(new GetYawCommand());
    }

    protected async GetPitch(): Promise<number> {
        return await this.sendCommand<number>(new GetPitchCommand());
    }

    protected async GetUserUUID(): Promise<string> {
        return await this.sendCommand<string>(new GetUserUUIDCommand());
    }

    protected async GetOnlinePlayers(): Promise<any> {
        return await this.sendCommand<any>(new GetOnlinePlayersCommand());
    }

    protected async GetOnlinePlayersWithUUID(): Promise<any> {
        return await this.sendCommand(new GetOnlinePlayersWithUUIDCommand()) as Promise<any>;
    }

    protected async GetServerTPS(): Promise<number> {
        return await this.sendCommand<number>(new GetServerTPSCommand());
    }

    protected async InteractEntity(
        entityId: number,
        interactionType: InteractType,
        hand: Hand = Hand.MainHand
    ): Promise<boolean> {
        return await this.sendCommand<boolean>(new InteractEntityCommand(entityId, interactionType, hand));
    }

    protected async CreativeGive(slot: number, itemType: ItemType, count: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new CreativeGiveCommand(slot, itemType, count));
    }

    protected async CreativeDelete(slot: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new CreativeDeleteCommand(slot));
    }

    protected async SendAnimation(hand: Hand = Hand.MainHand): Promise<boolean> {
        return await this.sendCommand<boolean>(new SendAnimationCommand(hand));
    }

    protected async SendPlaceBlock(
        location: Location,
        direction: Direction,
        hand: Hand = Hand.MainHand
    ): Promise<boolean> {
        return await this.sendCommand<boolean>(new SendPlaceBlockCommand(
            location.x,
            location.y,
            location.z,
            direction,
            hand));
    }

    protected async UseItemInHand(): Promise<boolean> {
        return await this.sendCommand<boolean>(new UseItemInHandCommand());
    }

    protected async GetInventoryEnabled(): Promise<boolean> {
        return await this.sendCommand<boolean>(new GetInventoryEnabledCommand());
    }

    protected async GetPlayerInventory(): Promise<any> {
        return await this.sendCommand(new GetPlayerInventoryCommand()) as Promise<any>;
    }

    protected async GetInventories(): Promise<Array<any>> {
        return await this.sendCommand<Array<any>>(new GetInventoriesCommand());
    }

    protected async WindowAction(windowId: number, slotId: number, windowActionType: WindowActionType): Promise<boolean> {
        return await this.sendCommand<boolean>(new WindowActionCommand(windowId, slotId, windowActionType));
    }

    protected async ChangeSlot(slotId: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new ChangeSlotCommand(slotId));
    }

    protected async GetCurrentSlot(): Promise<number> {
        return await this.sendCommand<number>(new GetCurrentSlotCommand());
    }

    protected async ClearInventories(): Promise<boolean> {
        return await this.sendCommand<boolean>(new ClearInventoriesCommand());
    }

    protected async UpdateSign(
        location: Location,
        line1: string,
        line2: string,
        line3: string,
        line4: string
    ): Promise<boolean> {
        return await this.sendCommand<boolean>(new UpdateSignCommand(
            location.x,
            location.y,
            location.z,
            line1,
            line2,
            line3,
            line4));
    }

    protected async SelectTrade(selectedSlot: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new SelectTradeCommand(selectedSlot));
    }

    protected async UpdateCommandBlock(
        location: Location,
        command: string,
        mode: CommandBlockMode,
        flags: CommandBlockFlags
    ): Promise<boolean> {
        return await this.sendCommand<boolean>(new UpdateCommandBlockCommand(
            location.x,
            location.y,
            location.z,
            command,
            mode,
            flags
        ));
    }

    protected async CloseInventory(windowId: number): Promise<boolean> {
        return await this.sendCommand<boolean>(new CloseInventoryCommand(windowId));
    }

    protected async GetMaxChatMessageLength(): Promise<number> {
        return await this.sendCommand<number>(new GetMaxChatMessageLengthCommand());
    }

    protected async Respawn(): Promise<boolean> {
        return await this.sendCommand<boolean>(new RespawnCommand());
    }

    protected async GetProtocolVersion(): Promise<ProtocolVersion> {
        return await this.sendCommand<ProtocolVersion>(new GetProtocolVersionCommand());
    }

    // ChatBot Events
    public async OnInitialize(): Promise<void> { }
    public async OnDestroy(): Promise<void> { }
    public async OnEventError(event: string, error: string): Promise<void> { }
    public async OnUnhandledEvent(event: string, data: any): Promise<void> { }
    protected async OnGameJoined(): Promise<void> { }
    protected async OnBlockBreakAnimation(entity: Entity, location: Location, stage: number): Promise<void> { }
    protected async OnEntityAnimation(entity: Entity, animation: number): Promise<void> { }
    protected async OnChatPrivate(sender: string, message: string, rawText: string): Promise<void> { }
    protected async OnChatPublic(username: string, message: string, rawText: string): Promise<void> { }
    protected async OnTeleportRequest(sender: string, rawText: string): Promise<void> { }
    protected async OnChatRaw(text: string, rawJson: any): Promise<void> { }
    protected async OnDisconnect(reason: string, message: string): Promise<void> { }
    protected async OnPlayerProperty(prop: any): Promise<void> { }
    protected async OnServerTpsUpdate(tps: number): Promise<void> { }
    protected async OnTimeUpdate(worldAge: number, timeOfDay: number): Promise<void> { }
    protected async OnEntityMove(entity: Entity): Promise<void> { }
    protected async OnInternalCommand(command: string, parameters: string, result: string): Promise<void> { }
    protected async OnEntitySpawn(entity: Entity): Promise<void> { }
    protected async OnEntityDespawn(entity: Entity): Promise<void> { }
    protected async OnHeldItemChange(itemSlot: number): Promise<void> { }
    protected async OnHealthUpdate(health: number, food: number): Promise<void> { }
    protected async OnExplosion(location: Location, strength: number, recordCount: number): Promise<void> { }
    protected async OnSetExperience(experienceBar: number, level: number, totalExperience: number): Promise<void> { }
    protected async OnGamemodeUpdate(playerName: string, uuid: string, gameMode: string): Promise<void> { }
    protected async OnLatencyUpdate(playerName: string, uuid: string, latency: number): Promise<void> { }
    protected async OnMapData(
        mapId: number,
        scale: number,
        trackingPosition: boolean,
        locked: boolean,
        icons: Array<MapIcon>,
        columnsUpdated: number,
        rowsUpdated: number,
        mapCoulmnX: number,
        mapRowZ: number,
        colors: Array<number>
    ): Promise<void> { }
    protected async OnTradeList(windowId: number, trades: any, villagerInfo: any): Promise<void> { }
    protected async OnTitle(action: string, titleText: string, subtitleText: string, actionBarText: string, fadeIn: number, stay: number, rawJson: any): Promise<void> { }
    protected async OnEntityEquipment(entity: Entity, slot: number, item: Item): Promise<void> { }
    protected async OnEntityEffect(entity: Entity, effect: string, amplifier: number, duration: number, flags: number): Promise<void> { }
    protected async OnScoreboardObjective(objectiveName: string, mode: number, objectiveValue: string, type: number, rawJson: any): Promise<void> { }
    protected async OnUpdateScore(entityName: string, action: number, objectiveName: string, type: number): Promise<void> { }
    protected async OnInventoryUpdate(inventoryId: number): Promise<void> { }
    protected async OnInventoryOpen(inventoryId: number): Promise<void> { }
    protected async OnInventoryClose(inventoryId: number): Promise<void> { }
    protected async OnPlayerJoin(uuid: string, name: string): Promise<void> { }
    protected async OnPlayerLeave(uuid: string, name: string): Promise<void> { }
    protected async OnDeath(): Promise<void> { }
    protected async OnRespawn(): Promise<void> { }
    protected async OnEntityHealth(entity: Entity, health: number): Promise<void> { }
    protected async OnEntityMetadata(entity: Entity, metadata: any): Promise<void> { }
    protected async OnPlayerStatus(statusId: number): Promise<void> { }
    protected async OnNetworkPacket(packetId: number, isLogin: boolean, isInbound: boolean, packetData: any): Promise<void> { }
};
