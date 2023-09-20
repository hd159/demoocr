import os
import re
import easyocr
from pdf2image import convert_from_path
import numpy as np
from text import textString
import csv

def perform_ocr_on_pdf(pdf_path, languages):
    # Convert PDF pages to images
    images = convert_from_path(pdf_path)
    reader = easyocr.Reader(languages, gpu=True)
    ocr_text = ""

    # Process each image
    for image in images:
        image_np = np.array(image)
        result = reader.readtext(image_np)
        text = ' '.join([res[1] for res in result])
        ocr_text += text + "\n"

    return ocr_text

def extractText(ocr_text):
    ocr_text_lower = ocr_text.lower()

    text_splits = ocr_text_lower.split('correspondence information')

    inventors =  text_splits[0]
    inventor_pattern = r"given name middle name family name suffix(.*?)(prefix|inventors must be listed)"
    inventor_matches = re.findall(inventor_pattern, inventors, re.DOTALL)
    inventor_results = []
    if inventor_matches:
        for match in inventor_matches:
            extracted_string = match[0].strip()
            inventor_dict = extract_inventor(extracted_string)
            inventor_results.append(inventor_dict)

    return inventor_results


def extract_inventor(string):
    extract_string = re.split(r'mailing address (?:0f|of) inventor|remove inventor legal name', string)
    name_part = extract_string[0]
    second_part = extract_string[1]

  # Extract name
    name_pattern = r'^(.*?) residence information'
    name_match = re.search(name_pattern, name_part)
    name = name_match.group(1).strip() if name_match else ''

    # Extract address
    address_pattern = r'address (.*?) address 2'
    address_match = re.search(address_pattern, second_part)
    address = address_match.group(1).strip() if address_match else ''

    # Extract city
    city_pattern = r'city (.*?) statelprovince'
    city_match = re.search(city_pattern, second_part)
    city = city_match.group(1).strip() if city_match else ''

    # Extract state/province
    state_province_pattern = r'statelprovince (.*?) postal code'
    state_province_match = re.search(state_province_pattern, second_part)
    state_province = state_province_match.group(1).strip() if state_province_match else ''

    # Extract postal code
    postal_code_pattern = r'postal code (.*?) countryi'
    postal_code_match = re.search(postal_code_pattern, second_part)
    postal_code = postal_code_match.group(1).strip() if postal_code_match else ''

    # Extract country
    country_pattern = r'countryi (.*)'
    country_match = re.search(country_pattern, second_part)
    country = country_match.group(1).strip() if country_match else ''

    inventor_dict = {
        'name': name,
        'address': address,
        'city': city,
        'state/ province': state_province,
        'postal code': postal_code,
        'country': country
    }

    return inventor_dict


def export_csv(inventor_results: list):
    csv_file = 'inventor.csv'
    fieldnames = inventor_results[0].keys()
    with open(csv_file, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames)
        writer.writeheader()
        writer.writerows(inventor_results)

def process_pdf():
    inventor_results = []
    pdf_folder_path = './pdf_files'
    languages = ['en']
    for filename in os.listdir(pdf_folder_path):
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(pdf_folder_path, filename)
            ocr_text = perform_ocr_on_pdf(pdf_path, languages)
            inventors = extractText(ocr_text)
            inventor_results.extend(inventors)

    export_csv(inventor_results)


process_pdf()