import { Collection, MongoClient, Document } from "mongodb";
import { CustomError } from "../domain/custom-error";
import { Link } from "../domain/link";
import { MongoUserRepository } from "./mongo-user-repository";
import { CosmosClient, Container } from "@azure/cosmos";

export class CosmosLinkRepository {
  private static instance: CosmosLinkRepository;

  private async toLinkMapping(document: Document) {
    if (!document.mapping || !document.link || !document.email) {
      throw CustomError.internal("Invalid user document.");
    }
    const user = await (await MongoUserRepository.getInstance()).getUser(document.email);
    return new Link(document.link, document.mapping, user.toSimpleUser());
  }

  constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("Link Cosmos DB container is required.");
    }
  }

  static async getInstance() {
    if (!this.instance) {

      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "links";
      const partitionKeyPath = ["/email"];

      if (!key || !endpoint) {
        throw new Error("Azure Cosmos DB Key, Endpoint or Database Name not provided. Exiting...");
      }

      const cosmosClient = new CosmosClient({ endpoint, key });

      const { database } = await cosmosClient.databases.createIfNotExists({ id: databaseName });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: {
          paths: partitionKeyPath
        }
      });

      this.instance = new CosmosLinkRepository(container);
    }
    return this.instance;
  };

  async createLinkMapping(link: Link): Promise<Link> {
    const result = await this.container.items.create({
      link: link.link,
      mapping: link.mapping,
      email: link.user.email
    });
    if (result && result.acknowledged && result.insertedId) {
      return this.getLinkMapping(link.mapping);
    } else {
      throw CustomError.internal("Could not create user.");
    }
  }

  async linkMappingExists(mapping: string): Promise<boolean> {
    const result = await this.collection.findOne({ mapping });
    return !!result;
  }

  async getLinkMapping(mapping: string): Promise<Link> {
    const result = await this.collection.findOne({ mapping });
    if (result) {
      return this.toLinkMapping(result)
    } else {
      throw CustomError.notFound("Link mapping not found.");
    }
  }

  async getAllLinkMappings(userEmail: string): Promise<Array<Link>> {
    const result = await this.collection.find({ email: userEmail }).toArray();
    if (result) {
      return Promise.all(result.map(this.toLinkMapping));
    } else {
      throw CustomError.notFound("Link mapping not found.");
    }
  }

  async removeLinkMapping(mapping: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ mapping });
    return !!result && result.acknowledged;
  }
}