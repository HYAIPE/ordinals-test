import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  createDynamoDbFundingDao,
  createLogger,
} from "@0xflick/ordinals-backend";
import { INewFundingAddressModel } from "@0xflick/ordinals-models";

const parentLogger = createLogger({
  name: "lambda/event/fundingWait",
});

const fundingDao = createDynamoDbFundingDao();

export const handler: APIGatewayProxyHandlerV2<{
  address: string;
  amount: number;
  expiration: number;
}> = async (event) => {
  const {
    pathParameters: { destinationAddress, network },
  } = event;
};
