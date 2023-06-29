declare namespace Trello {
    interface Board {
        closed: boolean;
        desc: string;
        descData: string;
        id: string;
        idMemberCreator: string;
        idOrganization: string;
        memberships: string;
        name: string;
        pinned: boolean;
        powerUps: string;
        shortUrl: string;
        starred: boolean;
        url: string;
    }

    interface Card {
        badges: CardBadges;
        checkItemStates: null;
        closed: boolean;
        dueComplete: boolean;
        dateLastActivity: string;
        desc: string;
        descData: { emoji: {} };
        due: string | null;
        dueReminder: null;
        email: null;
        id: string;
        idBoard: string;
        idChecklists: [];
        idList: string;
        idMembers: [];
        idMembersVoted: [];
        idShort: number;
        idAttachmentCover: null;
        labels: [[object]];
        idLabels: string[];
        manualCoverAttachment: boolean;
        name: string;
        pos: number;
        shortLink: string;
        shortUrl: string;
        start: null;
        subscribed: boolean;
        url: string;
        cover: CardCover;
        isTemplate: boolean;
        cardRole: null;
    }

    interface CardBadges {
        comments: number;
        location: boolean;
        votes: number;
    }

    interface CardCover {
        idAttachment: null;
        color: null;
        idUploadedBackground: null;
        size: "normal";
        brightness: "dark";
        idPlugin: null;
    }

    interface CardPayload {
        name?: string;
        desc?: string;
        pos?: string | number;
        due?: string;
        dueComplete?: boolean;
        idList: string;
        idMembers?: string;
        idLabels?: string;
        urlSource?: string;
        fileSource?: string;
        mimeType?: string;
        idCardSource?: string;
        keepFromSource?:
            | "all"
            | "attachments"
            | "checklists"
            | "comments"
            | "customFields"
            | "due"
            | "labels"
            | "members"
            | "start"
            | "stickers";
        address?: string;
        locationName?: string;
        coordinates?: string;
    }

    interface Limits {}

    interface List {
        id: string;
        name: string;
        closed: boolean;
        pos: number;
        softLimit: string;
        idBoard: string;
        subscribed: boolean;
        limits: Limits;
    }

    interface Member {
        id: string;
        avatarHash: string;
        fullName: string;
        initials: string;
        username: string;
    }

    interface Webhook {
        id: string;
        description: string;
        idModel: string;
        callbackURL: string;
        active: boolean;
        consecutiveFailures: number;
        firstConsecutiveFailDate: string | null;
    }

    interface WebhookPayload {
        description?: string;
        callbackURL: string;
        idModel: string;
        active?: boolean;
    }

    interface WebhookResponse {
        action: {
            appCreator: {} | null;
            id: string;
            idMemberCreator: string;
            data: {
                board: Pick<Board, "id" | "name" | "shortLink">;
                card: Pick<Card, "id" | "name" | "idList" | "shortLink">;
                listAfter: Pick<List, "id" | "name">;
                listBefore: Pick<List, "id" | "name">;
                old: { idList: string };
            };
            display: {
                entities: {
                    card: Pick<Card, "id" | "name" | "idList" | "shortLink"> & {
                        text: string;
                        type: "card";
                    };
                };
            };
            limits: {} | null;
            type:
                | "acceptEnterpriseJoinRequest"
                | "addAttachmentToCard"
                | "addChecklistToCard"
                | "addMemberToBoard"
                | "addMemberToCard"
                | "addMemberToOrganization"
                | "addOrganizationToEnterprise"
                | "addToEnterprisePluginWhitelist"
                | "addToOrganizationBoard"
                | "commentCard"
                | "convertToCardFromCheckItem"
                | "copyBoard"
                | "copyCard"
                | "copyCommentCard"
                | "createBoard"
                | "createCard"
                | "createList"
                | "createOrganization"
                | "deleteBoardInvitation"
                | "deleteCard"
                | "deleteOrganizationInvitation"
                | "disableEnterprisePluginWhitelist"
                | "disablePlugin"
                | "disablePowerUp"
                | "emailCard"
                | "enableEnterprisePluginWhitelist"
                | "enablePlugin"
                | "enablePowerUp"
                | "makeAdminOfBoard"
                | "makeNormalMemberOfBoard"
                | "makeNormalMemberOfOrganization"
                | "makeObserverOfBoard"
                | "memberJoinedTrello"
                | "moveCardFromBoard"
                | "moveCardToBoard"
                | "moveListFromBoard"
                | "moveListToBoard"
                | "removeChecklistFromCard"
                | "removeFromEnterprisePluginWhitelist"
                | "removeFromOrganizationBoard"
                | "removeMemberFromCard"
                | "removeOrganizationFromEnterprise"
                | "unconfirmedBoardInvitation"
                | "unconfirmedOrganizationInvitation"
                | "updateBoard"
                | "updateCard"
                | "updateCheckItemStateOnCard"
                | "updateChecklist"
                | "updateList"
                | "updateMember"
                | "updateOrganization";
            date: string;
            memberCreator: Member;
        };
        model: Board | Card | List;
    }
}
