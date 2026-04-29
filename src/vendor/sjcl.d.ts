declare const sjcl: {
  hash: {
    sha256: {
      hash(data: string): number[];
    };
  };
};

export default sjcl;
