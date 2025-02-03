import pickle
import pandas as pd

with open("tableau.pkl", "rb") as f:
    data_actuality = pickle.load(f)



data = pd.DataFrame(data_actuality)


print(data.columns)


data["length_content"] = data["content"].apply(lambda x: len(x.split(" ")) if x else 0)


data["length_Extractive_sum"] = data["Extractive_sum"].apply(lambda x: len(x.split(" ")) if x else 0)



data["length_Abstractive_sum"] = data["Abstractive_sum"].apply(lambda x: len(x.split(" ")) if x else 0)




data[["length_content", "length_Extractive_sum", "length_Abstractive_sum"]].to_csv("lenght_articles.csv", index=False)



