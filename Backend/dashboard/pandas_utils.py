from functools import lru_cache
from pathlib import Path

import pandas as pd


@lru_cache(maxsize=16)
def load_dataframe_cached(file_path: str) -> pd.DataFrame:
    """Load a dataset from disk once and reuse it across filter requests."""
    suffix = Path(file_path).suffix.lower()
    if suffix == '.csv':
        return pd.read_csv(file_path)
    if suffix == '.xlsx':
        return pd.read_excel(file_path)
    raise ValueError("Unsupported file format.")

def extract_dataframe_metadata(file_path , filename):
    """Extracts metadata from a CSV file and returns it as a dictionary."""
    suffix = Path(filename).suffix.lower()
    if suffix not in {'.csv', '.xlsx'}:
        raise ValueError("Unsupported file format.")

    df = load_dataframe_cached(file_path)
    
    metadata = {
        "columns" : [],
        "categorical" : {},
        "numerical" : {},
    }

    for col in df.columns:
        metadata["columns"].append(col)

        # If the column is numeric, extract the min and max for range sliders
        if pd.api.types.is_numeric_dtype(df[col]):
            metadata["numerical"][col] = {
                "min" : float(df[col].min()) if not pd.isna(df[col].min()) else 0 ,
                "max" : float(df[col].max()) if not pd.isna(df[col].max()) else 0 ,
            }
        # If the column is categorical, extract the unique values for dropdowns
        else:
            uniques = df[col].dropna().unique().tolist()
            metadata["categorical"][col] = [str(x) for x in uniques]
    return metadata


def apply_dynamic_filters(df , filters):
    """Applies dynamic filters to the DataFrame based on the provided filter criteria."""
    mask = pd.Series(True, index=df.index)

    for col , condition in filters.items():
        if col not in df.columns :
            continue 

        # If the condition is a list, it's a categorical filter (checkboxes)
        if isinstance(condition , list):
            if condition :
                mask &= df[col].isin(condition)

        # If the condition is a dictionary, it's a numerical range (sliders)
        elif isinstance(condition , dict):
            if 'min' in condition :
                mask &= df[col] >= condition['min']
            if 'max' in condition :
                mask &= df[col] <= condition['max']

    return df[mask]