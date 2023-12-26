import { FC } from "react";
import { useFundings } from "./hooks/useFundings";
import { Error } from "./Error";
import { Loading } from "./Loading";
import { Content } from "./Content";

export const Container: FC<{
  collectionId: string;
  destinationAddress: string;
}> = ({ collectionId, destinationAddress }) => {
  const {
    data: fundings,
    loading,
    error,
  } = useFundings({
    collectionId,
    destinationAddress,
  });
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <Error message={error.message} />;
  }
  return <Content fundings={fundings} />;
};
