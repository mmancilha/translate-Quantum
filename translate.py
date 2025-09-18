from transformers import pipeline

modelo = "Helsinki-NLP/opus-mt-tc-big-en-pt"

def translate():
  translate= pipeline(task="translation", model=modelo)
  textTranslated = translate("Hugging Face is a tecnology company based in New York and Paris", max_length=40)
  return print (textTranslated)

if __name__ == "__main__":
  translate()
