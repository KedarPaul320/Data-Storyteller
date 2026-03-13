import os 
import uuid 
import pandas as pd
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIview 
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser , FormParser
from .pandas_utils import extract_dataframe_metadata , apply_dynamic_filters

# Create your views here.
class FileUploadView(APIview):
    parser_classes = (MultiPartParser , FormParser)

    def post(self , request , *args , **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error" : "No file uploaded"} , status==status.HTTP_400_BAD_REQUEST)
        
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file_obj.name)[1]

        if ext not in ['.csv' , '.xlsx']:
            return Response({"error" : "Only .csv and .xlsx files are allowed"} , status=status.HTTP_400_BAD_REQUEST)
        
        fs = FileSystemStorage(location=settings.MEDIA_ROOT)
        saved_filename = f"{file_id}{ext}"
        fs.save(saved_filename , file_obj)

        full_path = os.path.join(settings.MEDIA_ROOT , saved_filename)

        try:
            metadata = extract_dataframe_metadata(full_path , saved_filename)
        except Exception as e:
            if os.path.exists(full_path):
                os.remove(full_path)
            return Response({"error" : str(e)} , status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "file_id" : file_id,
            "filename" : saved_filename,
            "metadata" : metadata,
        } , status=status.HTTP_201_CREATED)
    

class AnalyzeDataView(APIview):
    def post(self , request , *args , **kwargs):
        file_id = request.data.get('file_id')
        filename = request.data.get('filename')
        filters = request.data.get('filters' , {})

        if not file_id or not filename:
            return Response({"error" : "file_id and filename are required"} , status=status.HTTP_400_BAD_REQUEST)
        
        full_path = os.path.join(settings.MEDIA_ROOT , filename)
        if not os.path.exists(full_path):
            return Response({"error" : "File not found"} , status=status.HTTP_404_NOT_FOUND)
        
        try:
            if  filename.endswith('.csv'):
                df = pd.read_csv(full_path)
            elif filename.endswith('.xlsx'):
                df = pd.read_excel(full_path)
            else:
                return Response({"error" : "Unsupported file format"} , status=status.HTTP_400_BAD_REQUEST)
            
            filtered_df = apply_dynamic_filters(df , filters)
            filtered_df = filtered_df.fillna('')
            data_records = filtered_df.to_dict(orient='records')

            return Response({
                "total_rows" : len(df),
                "filtered_rows" : len(filtered_df),
                "data" : data_records
            } , status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : str(e)} , status=status.HTTP_400_BAD_REQUEST)
        
        