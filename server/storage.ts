import { randomUUID } from "crypto";

// TODO: Implement storage interface for Property Manager
// This will be implemented when building the backend

export interface IStorage {
  // Properties
  // getProperties(): Promise<Property[]>;
  // createProperty(property: InsertProperty): Promise<Property>;
  // etc.
}

export class MemStorage implements IStorage {
  constructor() {
    // TODO: Initialize storage
  }
}

export const storage = new MemStorage();
